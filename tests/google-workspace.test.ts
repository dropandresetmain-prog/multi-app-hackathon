import assert from "node:assert/strict";
import test from "node:test";
import {
  extractQuoteClaims,
  gmailMessageToEvidenceInput,
  revisionFromSourceTime,
} from "../lib/google/evidence";
import { buildSheetsProjectionRows } from "../lib/google/sheets";
import { applyCommand, ingestEvidence } from "../lib/procurement/domain";
import { createMission } from "../lib/procurement/fixtures";
import type { GmailMessageObservation } from "../lib/google/gmail";

const now = Date.parse("2026-09-14T00:00:00.000Z");

function message(
  overrides: Partial<GmailMessageObservation> &
    Pick<GmailMessageObservation, "messageId" | "observedAt">,
): GmailMessageObservation {
  return {
    threadId: "thread-1",
    from: "vendor@controlled.example",
    to: ["buyer@example.com"],
    subject: "Re: quote",
    snippet: "quote",
    bodyText: "Thanks for the RFQ.",
    retrievedAt: now + 60_000,
    labelIds: ["INBOX"],
    effectKey: null,
    ...overrides,
  };
}

test("Gmail revision follows source chronology, not retrieval order", () => {
  const older = revisionFromSourceTime(now);
  const newer = revisionFromSourceTime(now + 120_000);
  assert.ok(newer > older);
});

test("duplicate Gmail message identity is idempotent under domain ingest", () => {
  const m = createMission("gws-dup", "Need gifts", now);
  applyCommand(
    m,
    {
      type: "answer_requirements",
      quantity: 25,
      budgetCents: 75000,
      deadlineAt: now + 3 * 86400000,
      branded: true,
    },
    now,
  );
  const evidence = gmailMessageToEvidenceInput({
    vendorId: "studio",
    message: message({
      messageId: "msg-1",
      observedAt: now + 1000,
      bodyText:
        'QUOTE_CLAIMS_JSON: {"unitCents":2400,"setupCents":0,"deliveryCents":2500,"taxCents":0,"quantity":25,"moq":10,"stock":40,"deliveryAt":1758000000000,"branded":true,"currency":"SGD"}',
    }),
  });
  ingestEvidence(m, evidence);
  ingestEvidence(m, evidence);
  assert.equal(m.evidence.length, 1);
  assert.equal(m.evidenceVersion, 1);
});

test("older Gmail reply discovered later does not supersede a newer reply", () => {
  const m = createMission("gws-order", "Need gifts", now);
  applyCommand(
    m,
    {
      type: "answer_requirements",
      quantity: 25,
      budgetCents: 75000,
      deadlineAt: now + 3 * 86400000,
      branded: true,
    },
    now,
  );
  const newer = gmailMessageToEvidenceInput({
    vendorId: "studio",
    message: message({
      messageId: "msg-new",
      observedAt: now + 200_000,
      bodyText:
        'QUOTE_CLAIMS_JSON: {"unitCents":2400,"setupCents":0,"deliveryCents":2500,"taxCents":0,"quantity":25,"moq":10,"stock":40,"deliveryAt":1758000000000,"branded":true,"currency":"SGD"}',
    }),
  });
  const older = gmailMessageToEvidenceInput({
    vendorId: "studio",
    message: message({
      messageId: "msg-old",
      observedAt: now + 50_000,
      bodyText:
        'QUOTE_CLAIMS_JSON: {"unitCents":9900,"setupCents":0,"deliveryCents":0,"taxCents":0,"quantity":25,"moq":10,"stock":40,"deliveryAt":1758000000000,"branded":true,"currency":"SGD"}',
    }),
  });
  // Retrieve newer first, then discover older later.
  ingestEvidence(m, newer);
  ingestEvidence(m, older);
  const studio = m.vendors.find((v) => v.id === "studio")!;
  assert.equal(studio.evaluation.quote.unitCents, 2400);
  assert.ok(studio.evaluation.supersededEvidenceIds.includes("gmail:msg-old"));
});

test("later supplier correction creates new evidence and can change ranking inputs", () => {
  const m = createMission("gws-correct", "Need gifts", now);
  applyCommand(
    m,
    {
      type: "answer_requirements",
      quantity: 25,
      budgetCents: 75000,
      deadlineAt: now + 3 * 86400000,
      branded: true,
    },
    now,
  );
  ingestEvidence(
    m,
    gmailMessageToEvidenceInput({
      vendorId: "studio",
      message: message({
        messageId: "msg-a",
        observedAt: now + 10_000,
        bodyText:
          'QUOTE_CLAIMS_JSON: {"unitCents":1800,"setupCents":0,"deliveryCents":1500,"taxCents":0,"quantity":25,"moq":10,"stock":100,"deliveryAt":1757900000000,"branded":true,"currency":"SGD"}',
      }),
    }),
  );
  ingestEvidence(
    m,
    gmailMessageToEvidenceInput({
      vendorId: "studio",
      message: message({
        messageId: "msg-b",
        observedAt: now + 90_000,
        bodyText:
          'QUOTE_CLAIMS_JSON: {"deliveryAt":1758200000000}',
      }),
    }),
  );
  const studio = m.vendors.find((v) => v.id === "studio")!;
  assert.equal(studio.evaluation.quote.unitCents, 1800);
  assert.equal(studio.evaluation.quote.deliveryAt, 1758200000000);
});

test("extractQuoteClaims reads structured vendor blocks only", () => {
  assert.deepEqual(extractQuoteClaims("Thanks, we can help."), {});
  assert.equal(
    extractQuoteClaims(
      'Hello\nQUOTE_CLAIMS_JSON: {"unitCents":2400,"currency":"SGD","branded":true}\n',
    ).unitCents,
    2400,
  );
});

test("Sheets projection exposes normalized comparison fields", () => {
  const m = createMission("gws-sheet", "Need gifts", now);
  applyCommand(
    m,
    {
      type: "answer_requirements",
      quantity: 25,
      budgetCents: 75000,
      deadlineAt: now + 3 * 86400000,
      branded: true,
    },
    now,
  );
  ingestEvidence(
    m,
    gmailMessageToEvidenceInput({
      vendorId: "studio",
      message: message({
        messageId: "msg-sheet",
        observedAt: now + 10_000,
        bodyText:
          'QUOTE_CLAIMS_JSON: {"unitCents":2400,"setupCents":0,"deliveryCents":2500,"taxCents":0,"quantity":25,"moq":10,"stock":40,"deliveryAt":1758000000000,"branded":true,"currency":"SGD"}',
      }),
    }),
  );
  const rows = buildSheetsProjectionRows(m);
  const studio = rows.find((row) => row.vendorId === "studio")!;
  assert.equal(studio.channel, "Gmail");
  assert.equal(studio.unitPrice, "24.00");
  assert.equal(studio.eligibility, "eligible");
  assert.ok(studio.landedTotal);
});
