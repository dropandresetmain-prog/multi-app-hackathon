import type { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { fixtureEvidence } from "../lib/procurement/fixtures";
import type { AgentCommand } from "../lib/procurement/types";
import {
  bindingForEndpoint,
  loadBindings,
  loadCredentials,
  messagingProviderForEffect,
  planOutbound,
  readBackMatches,
  readMessage,
  sendChatMessage,
  unipileConfigured,
} from "../lib/unipile";

async function deliverUnipile(
  ctx: ActionCtx,
  key: string,
  effectKey: string,
  runId?: string,
): Promise<string> {
  const mission = await ctx.runQuery(internal.missions.read, { key });
  const effect = mission.effects.find((item) => item.key === effectKey);
  if (!effect) throw new Error("Unknown effect");
  const provider = messagingProviderForEffect(mission, effect);
  if (!provider) throw new Error("Effect is not a Unipile messaging effect");

  const credentials = loadCredentials(process.env);
  const bindings = loadBindings(process.env);
  if (!credentials)
    throw new Error(
      "Unipile credentials are not configured on this deployment",
    );

  const existing = await ctx.runQuery(internal.unipileStore.getReceipt, {
    effectKey,
  });
  const plan = planOutbound({
    mission,
    effect,
    binding: bindingForEndpoint(bindings, effect.endpointRef),
    existingReceiptKey: existing?.key ?? null,
  });

  if (plan.mode === "send") {
    const sent = await sendChatMessage({
      credentials,
      provider: plan.provider,
      accountId: plan.binding.accountId,
      chatId: plan.binding.chatId,
      text: plan.text,
    });
    const receiptId = await ctx.runMutation(internal.unipileStore.storeReceipt, {
      key: effect.key,
      endpointRef: effect.endpointRef,
      payload: effect.payload,
      provider: sent.provider,
      accountId: sent.accountId,
      chatId: sent.chatId,
      providerMessageId: sent.providerMessageId,
      text: sent.text,
    });
    await ctx.runMutation(internal.missions.acknowledge, {
      key,
      effectKey,
      receiptId,
      ...(runId ? { runId } : {}),
    });
    return `Unipile ${provider} API accepted the message; independent read-back is still required`;
  }

  if (!existing)
    throw new Error("Missing Unipile receipt for idempotent retry");
  await ctx.runMutation(internal.missions.acknowledge, {
    key,
    effectKey,
    receiptId: existing.id,
    ...(runId ? { runId } : {}),
  });
  return `Unipile ${provider} delivery reused prior receipt; duplicate send prevented`;
}

async function verifyUnipile(
  ctx: ActionCtx,
  key: string,
  effectKey: string,
  runId?: string,
): Promise<string> {
  const credentials = loadCredentials(process.env);
  if (!credentials)
    throw new Error(
      "Unipile credentials are not configured on this deployment",
    );
  const receipt = await ctx.runQuery(internal.unipileStore.getReceipt, {
    effectKey,
  });
  if (!receipt)
    throw new Error(
      "No Unipile receipt to verify; provider success is unverified",
    );

  const observed = await readMessage({
    credentials,
    providerMessageId: receipt.providerMessageId,
  });
  if (
    !readBackMatches({
      expectedText: receipt.text,
      expectedChatId: receipt.chatId,
      expectedMessageId: receipt.providerMessageId,
      observed,
    })
  )
    throw new Error("Unipile read-back does not match the intended effect");

  return await ctx.runMutation(internal.missions.verify, {
    key,
    effectKey,
    observed: {
      key: receipt.key,
      endpointRef: receipt.endpointRef,
      payload: receipt.payload,
      createdAt: receipt.createdAt,
    },
    ...(runId ? { runId } : {}),
  });
}

// Development fixture transport remains the default. When Unipile credentials and
// vendor bindings are present, WhatsApp / Instagram effects use the real provider
// while still calling the same effect and ingest_external_evidence contracts.
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
    const live =
      unipileConfigured(process.env) &&
      messagingProviderForEffect(mission, effect) !== null;

    if (live) return await deliverUnipile(ctx, key, effect.key, runId);

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
    const effect = mission.effects.find(
      (item) => item.key === command.effectKey,
    );
    if (!effect) throw new Error("Unknown effect");
    const live =
      Boolean(loadCredentials(process.env)) &&
      Boolean(loadBindings(process.env).length) &&
      messagingProviderForEffect(mission, effect) !== null;
    if (live) return await verifyUnipile(ctx, key, effect.key, runId);

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
  // Inbound fixture observation uses the same ingest contract as Unipile adapters.
  // It is not an agent tool and does not manufacture evidence inside domain policy.
  if (command.type === "request_quote" || command.type === "clarify_quote") {
    const mission = await ctx.runQuery(internal.missions.read, { key });
    const vendor = mission.vendors.find((item) => item.id === command.vendorId);
    const liveUnipileVendor =
      unipileConfigured(process.env) &&
      vendor &&
      (vendor.channel === "WhatsApp" || vendor.channel === "Instagram");
    if (!liveUnipileVendor) {
      const stage =
        command.type === "clarify_quote" ? "clarification" : "initial";
      await ctx.runMutation(internal.missions.apply, {
        key,
        command: JSON.stringify({
          type: "ingest_external_evidence",
          evidence: fixtureEvidence(
            mission,
            command.vendorId,
            stage,
            Date.now(),
          ),
        }),
      });
    }
  }
  return result;
}
