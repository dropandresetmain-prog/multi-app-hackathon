import type { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { fixtureEvidence } from "../lib/procurement/fixtures";
import type { AgentCommand, Effect, Mission } from "../lib/procurement/types";

function liveGoogle(): boolean {
  return process.env.GOOGLE_WORKSPACE_LIVE === "true";
}

function gmailVendor(mission: Mission, effect: Effect) {
  return mission.vendors.find(
    (vendor) => vendor.id === effect.targetId && vendor.channel === "Gmail",
  );
}

function threadFromMission(mission: Mission, vendorId: string): string | null {
  const prior = [...mission.evidence]
    .reverse()
    .find(
      (item) =>
        item.vendorId === vendorId &&
        item.provenance?.provider === "gmail" &&
        item.provenance.parentId,
    );
  return prior?.provenance?.parentId ?? null;
}

// Development fixture transport by default. When GOOGLE_WORKSPACE_LIVE=true,
// Gmail-channel effects use the real Gmail adapter with send + independent
// read-back. Future Unipile / web adapters follow the same boundary.
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

    const mission = await ctx.runQuery(internal.missions.read, { key });
    const vendor = gmailVendor(mission, effect);
    if (liveGoogle() && vendor && (effect.kind === "rfq" || effect.kind === "clarification")) {
      const delivered = await ctx.runAction(
        internal.googleWorkspace.deliverGmailEffect,
        {
          effectKey: effect.key,
          kind: effect.kind,
          endpointRef: effect.endpointRef,
          payload: effect.payload,
          threadId: threadFromMission(mission, vendor.id),
        },
      );
      // Payload identity stays in the transport ledger for exact match verification.
      // receiptId carries the durable Gmail message id used for external read-back.
      await ctx.runMutation(internal.missions.deliverFixture, args);
      await ctx.runMutation(internal.missions.acknowledge, {
        ...args,
        receiptId: delivered.messageId,
      });
      return `Gmail ${effect.kind} accepted by API (message ${delivered.messageId}, thread ${delivered.threadId}); verification still required`;
    }

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
    const mission = await ctx.runQuery(internal.missions.read, { key });
    const effect = mission.effects.find((item) => item.key === command.effectKey);
    if (!effect) throw new Error("Unknown effect key");
    const vendor = gmailVendor(mission, effect);

    if (
      liveGoogle() &&
      vendor &&
      effect.receiptId &&
      (effect.kind === "rfq" || effect.kind === "clarification")
    ) {
      await ctx.runAction(internal.googleWorkspace.readBackGmailEffect, {
        effectKey: effect.key,
        endpointRef: effect.endpointRef,
        payload: effect.payload,
        messageId: effect.receiptId,
      });
      const observed = await ctx.runQuery(internal.missions.readReceipt, {
        effectKey: command.effectKey,
      });
      return await ctx.runMutation(internal.missions.verify, {
        ...args,
        observed,
      });
    }

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
  // Inbound fixture observation uses the same ingest contract as live adapters.
  // When Gmail live mode is on, skip synthetic evidence for the Gmail vendor.
  if (command.type === "request_quote" || command.type === "clarify_quote") {
    const mission = await ctx.runQuery(internal.missions.read, { key });
    const vendor = mission.vendors.find((item) => item.id === command.vendorId);
    if (liveGoogle() && vendor?.channel === "Gmail") {
      return `${result} (waiting for real Gmail evidence)`;
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
  return result;
}
