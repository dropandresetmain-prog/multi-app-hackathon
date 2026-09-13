import type { Quote } from "../procurement/types";

const CLAIMS_MARKER = /SOMEBODY_CLAIMS\s*:\s*(\{[\s\S]*\})\s*$/m;

const ALLOWED_KEYS = new Set([
  "unitCents",
  "setupCents",
  "deliveryCents",
  "taxCents",
  "quantity",
  "moq",
  "stock",
  "deliveryAt",
  "branded",
  "currency",
]);

/**
 * Controlled suppliers include a machine-readable claims trailer so the messaging
 * adapter can feed `ingest_external_evidence` without inventing quote fields.
 * Example:
 *   Yep, $18 each with printing.
 *   SOMEBODY_CLAIMS:{"unitCents":1800,"deliveryCents":1500,"currency":"SGD",...}
 */
export function extractControlledClaims(text: string): Partial<Quote> | null {
  const match = text.match(CLAIMS_MARKER);
  if (!match?.[1]) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(match[1]);
  } catch {
    throw new Error("Controlled claims trailer is not valid JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("Controlled claims trailer must be a JSON object");
  const claims: Partial<Quote> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!ALLOWED_KEYS.has(key))
      throw new Error(`Unknown claim field in controlled trailer: ${key}`);
    if (key === "branded") {
      if (typeof value !== "boolean") throw new Error("Invalid branded claim");
      claims.branded = value;
      continue;
    }
    if (key === "currency") {
      if (typeof value !== "string" || !/^[A-Z]{3}$/.test(value))
        throw new Error("Invalid currency claim");
      claims.currency = value;
      continue;
    }
    if (typeof value !== "number" || !Number.isSafeInteger(value))
      throw new Error(`Invalid numeric claim: ${key}`);
    (claims as Record<string, number>)[key] = value;
  }
  if (Object.keys(claims).length === 0)
    throw new Error("Controlled claims trailer must include at least one field");
  return claims;
}

export function stripClaimsTrailer(text: string): string {
  return text.replace(CLAIMS_MARKER, "").trim();
}
