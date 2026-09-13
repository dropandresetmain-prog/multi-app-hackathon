import { extractControlledClaims, stripClaimsTrailer } from "./claims";
import { parseProviderTimestamp, sourceRevision } from "./chronology";
import type {
  InboundDecision,
  UnipileBinding,
  UnipileProvider,
  UnipileWebhookEvent,
} from "./types";
import { providerChannel } from "./types";

export function normalizeAccountType(value: string): UnipileProvider | null {
  const upper = value.trim().toUpperCase();
  if (upper === "WHATSAPP") return "whatsapp";
  if (upper === "INSTAGRAM") return "instagram";
  return null;
}

export function isOwnOutboundMessage(
  event: UnipileWebhookEvent,
  binding: UnipileBinding,
): boolean {
  const senderId = event.sender?.attendee_provider_id?.trim() ?? "";
  const accountUserId =
    event.account_info?.user_id?.trim() || binding.accountUserId;
  if (!senderId || !accountUserId) return false;
  return senderId === accountUserId;
}

export function decideInbound(args: {
  event: UnipileWebhookEvent;
  bindings: UnipileBinding[];
  /** Resolve configured vendor id from endpointRef. Fail closed when unknown. */
  resolveVendorId: (endpointRef: string) => string | null;
  alreadySeenMessageId?: (messageId: string) => boolean;
  retrievedAt?: number;
}): InboundDecision {
  const { event, bindings } = args;
  if (event.event && event.event !== "message_received")
    return { action: "reject", reason: `Unsupported Unipile event: ${event.event}` };

  const provider = normalizeAccountType(event.account_type);
  if (!provider)
    return {
      action: "reject",
      reason: `Unsupported account_type: ${event.account_type}`,
    };

  if (!event.account_id?.trim() || !event.chat_id?.trim() || !event.message_id?.trim())
    return { action: "reject", reason: "Webhook missing account/chat/message identity" };

  if (args.alreadySeenMessageId?.(event.message_id))
    return {
      action: "duplicate",
      reason: "Provider message already processed",
    };

  const binding = bindings.find(
    (b) =>
      b.accountId === event.account_id &&
      b.chatId === event.chat_id &&
      b.provider === provider,
  );
  if (!binding)
    return {
      action: "reject",
      reason: "Unknown or unbound Unipile account/chat",
    };

  if (isOwnOutboundMessage(event, binding))
    return {
      action: "ignore_own",
      reason: "Connected account outbound message filtered",
    };

  const vendorId = args.resolveVendorId(binding.endpointRef);
  if (!vendorId)
    return {
      action: "reject",
      reason: "No configured vendor for Unipile binding",
    };

  const text = (event.message ?? "").trim();
  if (!text)
    return { action: "reject", reason: "Empty supplier message" };

  let claims;
  try {
    claims = extractControlledClaims(text);
  } catch (error) {
    return {
      action: "reject",
      reason: error instanceof Error ? error.message : "Invalid controlled claims",
    };
  }
  if (!claims)
    return {
      action: "reject",
      reason: "Supplier message missing SOMEBODY_CLAIMS trailer",
    };

  let observedAt: number;
  try {
    observedAt = parseProviderTimestamp(event.timestamp);
  } catch (error) {
    return {
      action: "reject",
      reason: error instanceof Error ? error.message : "Invalid timestamp",
    };
  }

  return {
    action: "ingest",
    vendorId,
    endpointRef: binding.endpointRef,
    provider,
    channel: providerChannel[provider],
    observationId: event.message_id,
    chatId: event.chat_id,
    accountId: event.account_id,
    observedAt,
    revision: sourceRevision(observedAt),
    text: stripClaimsTrailer(text).slice(0, 1500) || text.slice(0, 1500),
    claims,
  };
}

export function evidenceFromInbound(
  decision: Extract<InboundDecision, { action: "ingest" }>,
  retrievedAt: number,
) {
  return {
    vendorId: decision.vendorId,
    source: `Unipile ${decision.channel}`,
    authority: "vendor" as const,
    revision: decision.revision,
    observedAt: decision.observedAt,
    text: decision.text,
    claims: decision.claims,
    provenance: {
      provider: decision.provider,
      channel: decision.channel,
      observationId: decision.observationId,
      parentId: decision.chatId,
      observedAt: decision.observedAt,
      retrievedAt,
      sourceLabel: `unipile:${decision.accountId}`,
    },
  };
}
