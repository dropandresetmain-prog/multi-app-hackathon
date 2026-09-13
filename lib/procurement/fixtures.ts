import type { Evidence, Mission, Quote, Vendor } from "./types";
export const emptyEvaluation = () => ({
  status: "waiting" as const,
  missing: [],
  conflicts: [],
  reasons: [],
  totalCents: null,
  quote: {},
  currentEvidenceIds: [],
  supersededEvidenceIds: [],
});
export function createMission(
  key: string,
  request: string,
  now: number,
): Mission {
  const vendors: Vendor[] = [
    {
      id: "catalogue",
      name: "The Everyday Co.",
      channel: "Web",
      product: "Canvas everyday tote",
    },
    {
      id: "studio",
      name: "Paper & Pine",
      channel: "Gmail",
      product: "Desk gift set",
    },
    {
      id: "express",
      name: "Good Things Studio",
      channel: "WhatsApp",
      product: "Custom canvas tote",
    },
    {
      id: "social",
      name: "Little Objects",
      channel: "Instagram",
      product: "Botanical desk kit",
    },
  ].map((v) => ({
    ...v,
    endpointRef: `fixture:${v.id}`,
    contacted: false,
    evaluation: emptyEvaluation(),
  })) as Vendor[];
  return {
    key,
    title: "Sponsor gifts, sorted.",
    request,
    createdAt: now,
    updatedAt: now,
    state: "clarifying",
    requirements: {
      quantity: null,
      budgetCents: null,
      deadlineAt: null,
      branded: null,
    },
    question: null,
    activity: "Ready to clarify your brief",
    evidenceVersion: 0,
    vendors,
    evidence: [],
    effects: [],
    recommendation: null,
    approvals: [],
    recommendationCounter: 0,
    run: null,
  };
}
// These are Development observations, not responses attributed to real providers.
export function fixtureEvidence(
  m: Mission,
  vendorId: string,
  stage: "initial" | "clarification" | "update",
  now: number,
): Evidence {
  const deadline = m.requirements.deadlineAt!;
  const quantity = m.requirements.quantity!;
  const base: Quote = {
    unitCents: 2200,
    setupCents: 0,
    deliveryCents: 2500,
    taxCents: 0,
    quantity,
    moq: 10,
    stock: 100,
    deliveryAt: deadline - 3600000,
    branded: true,
    currency: "SGD",
  };
  let claims: Partial<Quote> = base;
  let text =
    "Confirmed: all-in quote includes branding and tax, with delivery before your receiving deadline.";
  if (vendorId === "catalogue") {
    claims = {
      ...base,
      unitCents: 1400,
      moq: 50,
      deliveryAt: deadline + 86400000,
    };
    text =
      "Catalogue sample: $14 each. Minimum 50; custom orders need another day. Not a live web lookup.";
  }
  if (vendorId === "studio" && stage === "initial") {
    claims = {
      unitCents: 2400,
      quantity,
      moq: 10,
      stock: 40,
      currency: "SGD",
      branded: true,
    };
    text = `We can do ${quantity} desk sets at $24 each with your logo. Let me check delivery and the final charges.`;
  }
  if (vendorId === "studio" && stage !== "initial") {
    claims = { ...base, unitCents: 2400 };
    text =
      "Confirmed: $24 each, no setup charge or additional tax, $25 delivery. Stock available; arrival one hour before the deadline.";
  }
  if (vendorId === "express") {
    claims = { ...base, unitCents: 1800, deliveryCents: 1500 };
    text =
      "Yep, $18 each with printing + $15 delivery. Everything included. We can get them there before your cutoff.";
  }
  if (vendorId === "express" && stage === "update") {
    claims = { deliveryAt: deadline + 86400000 };
    text =
      "Correction from production: printed totes can only arrive the following day. Our earlier delivery promise was wrong.";
  }
  if (vendorId === "social") {
    claims = { ...base, unitCents: 2900, deliveryCents: 3000 };
    text =
      "Our desk kits are $29 each, branded sleeves included. $30 delivery, no extra tax or setup. Ready in time.";
  }
  return {
    id: `${vendorId}:${stage}`,
    vendorId,
    source: `Development fixture / ${vendorId}`,
    authority: vendorId === "catalogue" ? "catalogue" : "vendor",
    revision: stage === "initial" ? 1 : stage === "clarification" ? 2 : 3,
    observedAt: now,
    text,
    claims,
  };
}
