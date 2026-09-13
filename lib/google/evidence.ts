import type { EvidenceInput, Quote } from "../procurement/types";
import type { GmailMessageObservation } from "./gmail";

const REVISION_EPOCH_MS = 1_700_000_000_000;

/**
 * Map Gmail source time onto EvidenceInput.revision without depending on
 * retrieval order. Domain reconcile sorts by revision within equal authority.
 */
export function revisionFromSourceTime(observedAt: number): number {
  const revision = Math.floor((observedAt - REVISION_EPOCH_MS) / 1000);
  if (!Number.isSafeInteger(revision) || revision < 1)
    return 1;
  if (revision > 100000000) return 100000000;
  return revision;
}

/**
 * Lightweight claim extraction for controlled vendor replies.
 * Prefer an explicit JSON block when present; otherwise leave claims sparse
 * so domain policy can demand clarification.
 */
export function extractQuoteClaims(text: string): Partial<Quote> {
  const block = text.match(/QUOTE_CLAIMS_JSON:\s*(\{[\s\S]*?\})/i);
  if (block?.[1]) {
    try {
      const parsed: unknown = JSON.parse(block[1]);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const claims: Partial<Quote> = {};
        const obj = parsed as Record<string, unknown>;
        for (const key of [
          "unitCents",
          "setupCents",
          "deliveryCents",
          "taxCents",
          "quantity",
          "moq",
          "stock",
          "deliveryAt",
        ] as const) {
          if (typeof obj[key] === "number" && Number.isSafeInteger(obj[key]))
            claims[key] = obj[key];
        }
        if (typeof obj.branded === "boolean") claims.branded = obj.branded;
        if (typeof obj.currency === "string" && /^[A-Z]{3}$/.test(obj.currency))
          claims.currency = obj.currency;
        return claims;
      }
    } catch {
      // Fall through to sparse claims.
    }
  }
  return {};
}

export function gmailMessageToEvidenceInput(args: {
  vendorId: string;
  message: GmailMessageObservation;
  claims?: Partial<Quote>;
}): EvidenceInput {
  const text =
    args.message.bodyText.trim() ||
    args.message.snippet.trim() ||
    "(empty Gmail body)";
  const bounded = text.length > 1500 ? `${text.slice(0, 1490)}…` : text;
  return {
    vendorId: args.vendorId,
    source: `Gmail / ${args.message.from || "vendor"}`,
    authority: "vendor",
    revision: revisionFromSourceTime(args.message.observedAt),
    observedAt: args.message.observedAt,
    text: bounded,
    claims: args.claims ?? extractQuoteClaims(bounded),
    provenance: {
      provider: "gmail",
      channel: "Gmail",
      observationId: args.message.messageId,
      parentId: args.message.threadId,
      observedAt: args.message.observedAt,
      retrievedAt: args.message.retrievedAt,
      sourceLabel: args.message.subject || "Gmail supplier reply",
    },
  };
}
