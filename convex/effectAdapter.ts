import type { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { fixtureEvidence } from "../lib/procurement/fixtures";
import type { AgentCommand, Effect, Mission } from "../lib/procurement/types";
import {
  createOrReconcilePurchaseOrder,
  parsePurchaseOrderIntentPayload,
  readBackPurchaseOrder,
  readConfig,
} from "../lib/accounting/quickbooks";
import { sourceCatalogueEvidence } from "../lib/web/sourceCatalogueEvidence";

function purchaseOrderIntent(mission: Mission, effect: Effect) {
  const vendor = mission.vendors.find((entry) => entry.id === effect.targetId);
  if (!vendor) throw new Error("Unknown vendor for purchase order effect");
  const parsed = parsePurchaseOrderIntentPayload(effect.payload);
  return {
    ...parsed,
    effectKey: effect.key,
    missionKey: mission.key,
    vendorName: vendor.name,
    product: vendor.product,
  };
}

// Transport boundary: Web catalogue uses public retrieval; purchase_order uses
// QuickBooks Online Sandbox create + independent read-back; outreach channels
// still use Development fixtures until Unipile/Google land. All paths call the
// same effect and ingest_external_evidence contracts. Not a plugin registry.
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

    if (effect.kind === "purchase_order") {
      const mission = await ctx.runQuery(internal.missions.read, { key });
      const intent = purchaseOrderIntent(mission, effect);
      const result = await createOrReconcilePurchaseOrder(
        readConfig(process.env),
        intent,
        effect.receiptId,
      );
      await ctx.runMutation(internal.missions.acknowledge, {
        ...args,
        receiptId: result.providerId,
      });
      return result.created
        ? "QuickBooks Purchase Order create returned success; verification is still required"
        : "QuickBooks Purchase Order reconciled without duplicate create; verification is still required";
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
    const effect = mission.effects.find(
      (entry) => entry.key === command.effectKey,
    );
    if (!effect) throw new Error("Unknown effect");

    if (effect.kind === "purchase_order") {
      if (!effect.receiptId)
        throw new Error("No QuickBooks provider identity to read back");
      const intent = purchaseOrderIntent(mission, effect);
      await readBackPurchaseOrder(
        readConfig(process.env),
        effect.receiptId,
        intent,
      );
      return await ctx.runMutation(internal.missions.verify, {
        ...args,
        observed: {
          key: effect.key,
          endpointRef: effect.endpointRef,
          payload: effect.payload,
          createdAt: Date.now(),
        },
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
