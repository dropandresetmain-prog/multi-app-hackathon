import {
  assertComplete,
  authorizeEffect,
  transition,
  type CoreWorkerContract,
} from "../reliability/core";
import { fixtureEvidence } from "./fixtures";
import type {
  AgentCommand,
  Approval,
  Effect,
  Evaluation,
  Evidence,
  Mission,
  Quote,
  QuoteField,
  UserCommand,
  Workflow,
} from "./types";

const transitions: Record<Workflow, Workflow[]> = {
  clarifying: ["sourcing"],
  sourcing: ["awaiting_approval"],
  awaiting_approval: ["sourcing", "approved"],
  approved: ["verifying", "blocked"],
  verifying: ["complete", "blocked"],
  complete: ["blocked"],
  blocked: [],
};
const fields: QuoteField[] = [
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
];
function move(m: Mission, next: Workflow) {
  m.state = transition(m.state, next, transitions);
}
function bounded(text: string, name: string, max = 1500) {
  if (!text.trim() || text.length > max)
    throw new Error(`${name} must contain 1–${max} characters`);
}
function integer(
  value: number,
  name: string,
  minimum = 0,
  maximum = 100000000,
) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum)
    throw new Error(`Invalid ${name}`);
}
export function vendor(m: Mission, id: string) {
  const found = m.vendors.find((v) => v.id === id);
  if (!found || found.endpointRef !== `fixture:${found.id}`)
    throw new Error("Unknown vendor or unconfigured recipient endpoint");
  return found;
}
export function evaluate(m: Mission, vendorId: string): Evaluation {
  const evidence = m.evidence.filter((e) => e.vendorId === vendorId);
  const quote: Partial<Quote> = {};
  const current = new Set<string>();
  const superseded = new Map<string, string[]>();
  const conflicts: string[] = [];
  for (const field of fields) {
    const candidates = evidence
      .filter((e) => e.claims[field] !== undefined)
      .sort(
        (a, b) =>
          Number(b.authority === "vendor") - Number(a.authority === "vendor") ||
          b.revision - a.revision,
      );
    if (!candidates.length) continue;
    const top = candidates[0];
    const peers = candidates.filter(
      (e) => e.authority === top.authority && e.revision === top.revision,
    );
    candidates
      .filter((e) => !peers.includes(e))
      .forEach((e) =>
        superseded.set(e.id, [...(superseded.get(e.id) ?? []), field]),
      );
    peers.forEach((e) => current.add(e.id));
    if (peers.some((e) => e.claims[field] !== top.claims[field])) {
      conflicts.push(field);
      continue;
    }
    Object.assign(quote, { [field]: top.claims[field] });
  }
  const missing = fields.filter(
    (f) => quote[f] === undefined && !conflicts.includes(f),
  );
  const reasons: string[] = [];
  const r = m.requirements;
  let totalCents: number | null = null;
  if (
    r.quantity === null ||
    r.budgetCents === null ||
    r.deadlineAt === null ||
    r.branded === null
  )
    reasons.push("Mission requirements need confirmation");
  if (missing.length === 0 && conflicts.length === 0) {
    const q = quote as Quote;
    totalCents =
      q.quantity * q.unitCents + q.setupCents + q.deliveryCents + q.taxCents;
    if (q.currency !== "SGD")
      reasons.push("Currency must be SGD; conversion is not confirmed");
    if (q.quantity !== r.quantity)
      reasons.push("Quoted quantity does not match the brief");
    if (q.moq > (r.quantity ?? 0))
      reasons.push(`Minimum order ${q.moq} exceeds requested quantity`);
    if (q.stock < (r.quantity ?? 0))
      reasons.push("Insufficient confirmed stock");
    if (q.deliveryAt > (r.deadlineAt ?? 0))
      reasons.push("Delivery misses the hard deadline");
    if (r.branded && !q.branded)
      reasons.push("Required branding is unavailable");
    if (totalCents > (r.budgetCents ?? 0))
      reasons.push("Landed cost exceeds the approved budget");
  }
  return {
    status: !evidence.length
      ? "waiting"
      : missing.length || conflicts.length
        ? "needs_clarification"
        : reasons.length
          ? "ineligible"
          : "eligible",
    missing,
    conflicts,
    reasons,
    totalCents,
    quote,
    currentEvidenceIds: [...current],
    supersededEvidenceIds: evidence
      .filter((e) => !current.has(e.id))
      .map((e) => e.id),
    supersededClaims: [...superseded].map(([evidenceId, fields]) => ({
      evidenceId,
      fields,
    })),
  };
}
export function ingestEvidence(m: Mission, e: Evidence) {
  vendor(m, e.vendorId);
  if (m.evidence.some((old) => old.id === e.id)) {
    const old = m.evidence.find((old) => old.id === e.id)!;
    if (
      JSON.stringify(old.claims) !== JSON.stringify(e.claims) ||
      old.revision !== e.revision ||
      old.vendorId !== e.vendorId
    )
      throw new Error("Evidence identity was reused with different content");
    return;
  }
  if (m.evidence.length >= 120)
    throw new Error(
      "Mission evidence limit reached; start a new Development mission",
    );
  integer(e.revision, "source revision", 1);
  for (const [field, value] of Object.entries(e.claims)) {
    if (!fields.includes(field as QuoteField))
      throw new Error("Unknown quote field");
    if (field === "branded") {
      if (typeof value !== "boolean") throw new Error("Invalid branding claim");
    } else if (field === "currency") {
      if (typeof value !== "string" || !/^[A-Z]{3}$/.test(value))
        throw new Error("Invalid currency");
    } else
      integer(
        value as number,
        field,
        field === "quantity" || field === "deliveryAt" ? 1 : 0,
        field === "deliveryAt" ? 9000000000000 : 100000000,
      );
  }
  m.evidence.push(e);
  m.evidenceVersion++;
  m.vendors.forEach((v) => {
    v.evaluation = evaluate(m, v.id);
  });
  // Even a still-viable winner needs a new decision against changed evidence.
  if (m.state === "awaiting_approval") {
    move(m, "sourcing");
    m.recommendation = null;
  }
  if (["approved", "verifying", "complete"].includes(m.state)) {
    move(m, "blocked");
    m.activity =
      "Evidence changed after approval. Commitment is frozen for human review.";
  }
}
function latestApproval(m: Mission): Approval | undefined {
  return [...m.approvals]
    .reverse()
    .find(
      (a) =>
        a.decision === "approved" &&
        a.recommendationVersion === m.recommendation?.version &&
        a.evidenceVersion === m.evidenceVersion,
    );
}
export function contract(m: Mission): CoreWorkerContract {
  const approval = latestApproval(m);
  return {
    objective: m.request,
    idempotencyScope: m.key,
    approvalVersion: approval?.version ?? null,
    authorizedEffectKeys:
      m.state === "blocked" ? [] : m.effects.map((e) => e.key),
    requiredVerifiedEffectKeys: m.effects.map((e) => e.key),
  };
}
function addEffect(
  m: Mission,
  kind: Effect["kind"],
  targetId: string,
  payload: string,
  suffix = "",
) {
  const key = `${kind}:${m.key}:${targetId}${suffix}`;
  if (m.effects.some((e) => e.key === key)) return;
  if (m.effects.length >= 80) throw new Error("Mission effect limit reached");
  const gated = ["confirmation", "rejection", "purchase_order"].includes(kind);
  m.effects.push({
    key,
    kind,
    targetId,
    endpointRef:
      kind === "purchase_order"
        ? "fixture:accounting"
        : vendor(m, targetId).endpointRef,
    payload,
    gated,
    approvalVersion: gated ? (latestApproval(m)?.version ?? null) : null,
    status: "pending",
    attempts: 0,
    receiptId: null,
    verifiedAt: null,
  });
}
export function effectForExecution(m: Mission, key: string): Effect {
  const e = m.effects.find((e) => e.key === key);
  if (!e) throw new Error("Unknown effect");
  if (e.kind !== "purchase_order") {
    if (vendor(m, e.targetId).endpointRef !== e.endpointRef)
      throw new Error("Recipient binding changed");
  } else if (e.endpointRef !== "fixture:accounting")
    throw new Error("Unknown accounting endpoint");
  authorizeEffect(contract(m), e);
  if (e.gated && !["approved", "verifying", "complete"].includes(m.state))
    throw new Error("Commitment is not allowed in this workflow state");
  return e;
}
export function applyCommand(
  m: Mission,
  command: Exclude<
    AgentCommand | UserCommand,
    | { type: "create" }
    | { type: "run_agent" }
    | { type: "execute_effect" }
    | { type: "verify_effect" }
  >,
  now: number,
): string {
  let message = "";
  switch (command.type) {
    case "ask_requirements":
      if (m.state !== "clarifying")
        throw new Error("Requirements already confirmed");
      bounded(command.question, "Question");
      m.question = command.question;
      message = command.question;
      break;
    case "answer_requirements":
      if (m.state !== "clarifying")
        throw new Error("Requirements are frozen for this mission");
      integer(command.quantity, "quantity", 1, 1000);
      integer(command.budgetCents, "budget", 1, 10000000);
      integer(command.deadlineAt, "deadline", now + 1, 9000000000000);
      m.requirements = {
        quantity: command.quantity,
        budgetCents: command.budgetCents,
        deadlineAt: command.deadlineAt,
        branded: command.branded,
      };
      m.question = null;
      move(m, "sourcing");
      message = "Brief confirmed. Ready to source four vendor options.";
      break;
    case "request_quote": {
      if (m.state !== "sourcing")
        throw new Error("Sourcing requires confirmed requirements");
      const v = vendor(m, command.vendorId);
      if (v.contacted) return "Quote already requested; duplicate prevented.";
      v.contacted = true;
      if (v.channel !== "Web")
        addEffect(m, "rfq", v.id, JSON.stringify(m.requirements));
      ingestEvidence(m, fixtureEvidence(m, v.id, "initial", now));
      message = `${v.name}: received initial Development evidence.`;
      break;
    }
    case "clarify_quote": {
      if (m.state !== "sourcing")
        throw new Error("Clarification is only allowed while sourcing");
      bounded(command.question, "Question");
      const v = vendor(m, command.vendorId);
      if (!v.contacted) throw new Error("Request a quote first");
      if (v.channel === "Web")
        throw new Error("Catalogue vendor has no outreach channel");
      // One clarification set per current evidence version; retries share its logical identity.
      const suffix = `:${m.evidenceVersion}`;
      if (!m.evidence.some((e) => e.id === `${v.id}:clarification`)) {
        addEffect(m, "clarification", v.id, command.question, suffix);
        ingestEvidence(m, fixtureEvidence(m, v.id, "clarification", now));
      }
      message = `${v.name}: clarification evidence reconciled.`;
      break;
    }
    case "inject_update":
      if (!m.vendors.find((v) => v.id === "express")?.contacted)
        throw new Error("Collect Good Things Studio's initial quote first");
      ingestEvidence(m, fixtureEvidence(m, "express", "update", now));
      message =
        "Delivery correction: Good Things Studio now misses the deadline. Earlier evidence is retained.";
      break;
    case "recommend": {
      if (m.state !== "sourcing")
        throw new Error("Recommendation requires sourcing state");
      bounded(command.rationale, "Recommendation rationale");
      if (
        m.vendors.some(
          (v) => !v.contacted || v.evaluation.status === "needs_clarification",
        )
      )
        throw new Error(
          "Collect and clarify all shortlisted quotes before comparison",
        );
      const v = vendor(m, command.vendorId);
      v.evaluation = evaluate(m, v.id);
      if (
        v.evaluation.status !== "eligible" ||
        v.evaluation.totalCents === null
      )
        throw new Error("Only a complete, eligible quote can be recommended");
      m.recommendationCounter++;
      m.recommendation = {
        vendorId: v.id,
        version: m.recommendationCounter,
        evidenceVersion: m.evidenceVersion,
        totalCents: v.evaluation.totalCents,
        rationale: command.rationale,
      };
      move(m, "awaiting_approval");
      message = `${v.name} recommended. Human approval required before any commitment.`;
      break;
    }
    case "approve":
    case "reject": {
      const decision = command.type === "approve" ? "approved" : "rejected";
      const previous = m.approvals.find(
        (a) => a.recommendationVersion === command.recommendationVersion,
      );
      if (previous) {
        if (previous.decision !== decision)
          throw new Error(
            "This recommendation already has a different decision",
          );
        return "Decision already recorded; duplicate prevented.";
      }
      const rec = m.recommendation;
      if (
        m.state !== "awaiting_approval" ||
        !rec ||
        rec.version !== command.recommendationVersion ||
        rec.evidenceVersion !== m.evidenceVersion
      )
        throw new Error(
          "Recommendation changed; review the current evidence before deciding",
        );
      if (evaluate(m, rec.vendorId).status !== "eligible")
        throw new Error("Recommended vendor is no longer eligible");
      if (m.approvals.length >= 20)
        throw new Error(
          "Decision limit reached; start a new Development mission",
        );
      m.approvals.push({
        version: m.approvals.length + 1,
        recommendationVersion: rec.version,
        evidenceVersion: m.evidenceVersion,
        vendorId: rec.vendorId,
        decision,
        at: now,
      });
      if (decision === "rejected") {
        move(m, "sourcing");
        m.recommendation = null;
        message =
          "Recommendation declined. Agent may investigate or propose another option.";
        break;
      }
      move(m, "approved");
      const payload = JSON.stringify({
        vendorId: rec.vendorId,
        quantity: m.requirements.quantity,
        totalCents: rec.totalCents,
        currency: "SGD",
        evidenceVersion: rec.evidenceVersion,
      });
      addEffect(m, "confirmation", rec.vendorId, payload);
      m.vendors
        .filter((v) => v.id !== rec.vendorId && v.channel !== "Web")
        .forEach((v) =>
          addEffect(
            m,
            "rejection",
            v.id,
            "This procurement has been awarded to another supplier.",
          ),
        );
      addEffect(m, "purchase_order", rec.vendorId, payload);
      message =
        "Human approval persisted. Development commitment effects are now permitted.";
      break;
    }
    case "complete_mission":
      if (m.state !== "verifying")
        throw new Error("Workflow must be verifying before completion");
      assertComplete(contract(m), m.effects);
      move(m, "complete");
      message =
        "Development workflow complete. All required fixture effects independently read back and verified.";
      break;
  }
  if (m.state !== "blocked") m.activity = message;
  m.updatedAt = now;
  return message;
}
export function beginVerification(m: Mission) {
  if (m.state === "approved") move(m, "verifying");
}
