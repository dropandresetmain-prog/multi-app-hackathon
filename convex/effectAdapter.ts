import type { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { fixtureEvidence } from "../lib/procurement/fixtures";
import type { AgentCommand, Mission } from "../lib/procurement/types";
import { sourceCatalogueEvidence } from "../lib/web/sourceCatalogueEvidence";

// Transport boundary: Development fixtures for outreach channels; public web
// retrieval for the Web catalogue vendor. All paths still call the same
// effect and ingest_external_evidence contracts. Not a plugin registry.
export async function dispatch(
  ctx: ActionCtx,
  key: string,
  command: AgentCommand,
  runId?: string,
): Promise<string> {
  const args = {
    key,
    effectKey: "effectKey" in command ? command.effectKey : "",
    ...(runId ? { runId } : {}),
  };
  if (command.type === "execute_effect") {
    const effect = await ctx.runMutation(internal.missions.attempt, args);
    if (effect.status === "verified" || effect.status === "unverified")
      return `Effect already ${effect.status}; no duplicate delivery`;
    const receiptId = await ctx.runMutation(
      internal.missions.deliverFixture,
      args,
    );
    await ctx.runMutation(internal.missions.acknowledge, {
      ...args,
      receiptId,
    });
    return "Development fixture delivery succeeded; verification is still required";
  }
  if (command.type === "verify_effect") {
    const observed = await ctx.runQuery(internal.missions.readReceipt, {
      effectKey: command.effectKey,
    });
    return await ctx.runMutation(internal.missions.verify, {
      ...args,
      observed,
    });
  }
  const result = await ctx.runMutation(internal.missions.apply, {
    key,
    command: JSON.stringify(command),
    ...(runId ? { runId } : {}),
  });
  if (command.type === "request_quote" || command.type === "clarify_quote") {
    await ingestInboundObservation(ctx, key, command);
  }
  return result;
}

async function ingestInboundObservation(
  ctx: ActionCtx,
  key: string,
  command:
    | { type: "request_quote"; vendorId: string }
    | { type: "clarify_quote"; vendorId: string; question: string },
): Promise<void> {
  const mission = (await ctx.runQuery(internal.missions.read, {
    key,
  })) as Mission;
  const configured = mission.vendors.find((v) => v.id === command.vendorId);
  if (!configured) return;

  if (configured.channel === "Web") {
    if (command.type === "clarify_quote") return;
    const evidence = await sourceCatalogueEvidence(mission, command.vendorId);
    await ctx.runMutation(internal.missions.apply, {
      key,
      command: JSON.stringify({
        type: "ingest_external_evidence",
        evidence,
      }),
    });
    return;
  }

  const stage =
    command.type === "clarify_quote" ? "clarification" : "initial";
  await ctx.runMutation(internal.missions.apply, {
    key,
    command: JSON.stringify({
      type: "ingest_external_evidence",
      evidence: fixtureEvidence(mission, command.vendorId, stage, Date.now()),
    }),
  });
}
