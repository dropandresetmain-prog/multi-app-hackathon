# Decisions Log

This file records settled decisions that should not be silently reopened during the hackathon.

## D001 — General reliability core

**Decision:** Build a role-agnostic Reliability Core for autonomous workers.

**Consequence:** Procurement-specific rules stay outside the core.

---

## D002 — Role Adapters

**Decision:** Professional/domain judgment lives in Role Adapters.

**Current adapter:** Procurement.

---

## D003 — Canonical contract term

**Decision:** The boundary between role-specific interpretation and reliable execution is the **Core Worker Contract**.

---

## D004 — Procurement demo

**Decision:** The hackathon demo is last-minute corporate gifting for a small SME.

**Scenario shape:** roughly 20–30 people, sponsor gift budget approved only about three days before the event.

---

## D005 — One worker on the critical path

**Decision:** Do not recreate dynamic multi-agent staffing.

**Reason:** Army of Interns showed that staffing/delegation topology created failure modes that did not strengthen this demo's core thesis.

---

## D006 — Simulate people, not integrations

**Decision:** Controlled accounts may play vendor humans, but judged app interactions are real.

**Vendor paths:**

- A: real web catalogue/vendor;
- B: controlled Gmail vendor identity;
- C: controlled WhatsApp number via Unipile;
- D: controlled Instagram counterparty via Unipile.

---

## D007 — Instagram is in the intended main path

**Decision:** Build with Instagram sourcing in mind from the start.

**Cut rule:** remove only if webhook/provider behavior materially threatens completion.

---

## D008 — Calendar and Drive are real context inputs

**Decision:** Keep Google Calendar for event/delivery timing and Drive for real event/logo/quote evidence where useful.

These are not decorative app-count integrations.

---

## D009 — Sheets is a user-facing projection

**Decision:** Google Sheets should show the normalized comparison because SME users commonly work in spreadsheets.

**Invariant:** Convex remains the operational SSOT. Sheets does not own workflow truth.

---

## D010 — QuickBooks Sandbox is the accounting target

**Decision:** Use QuickBooks Online Sandbox for the approved Purchase Order side effect.

**Acceptance:** create PO + independent read-back verification.

**Out of scope:** invoice, bill, payment, banking, or production accounting writes.

---

## D011 — Human approval gates commitment

**Decision:** The worker may source, clarify, normalize and recommend autonomously.

Human approval is required before final vendor commitment and Purchase Order creation.

No payment automation.

---

## D012 — Convex is the operational SSOT

**Decision:** Persist workflow, vendor, approval, effect and verification state in Convex.

**Safety invariant:** every agent task that can touch Convex must name and verify exact Development / Preview / Production deployment identity and permissions before writes.

Never rely on implicit/current CLI deployment state.

---

## D013 — Free OpenRouter first

**Decision:** Prefer free OpenRouter models that pass structured-output/tool/reconciliation tests.

**Fallback:** direct OpenAI API if free models are not reliable enough.

From the first runtime milestone include non-secret flag:

`LIVE_AI_ENABLED=true|false`

No separate `DEMO_MODE` is currently required.

---

## D014 — Web search capability is provider-agnostic

**Decision:** Procurement logic should depend on a bounded `search_web` / evidence capability rather than one hard-coded provider.

Use a suitable model's web-search capability when reliable; direct Exa is available for controlled source URLs/evidence extraction.

---

## D015 — Models do not resolve communication identity

**Decision:** Models work with stable vendor IDs. Application state resolves actual email / Unipile account / chat identifiers.

No free-form recipient invention in the critical path.

---

## D016 — Completion requires verification

**Decision:** Successful API/tool responses are not enough to mark the workflow complete.

Important side effects require read-back or equivalent external evidence. Partial/unverified states remain explicit.

---

## D017 — Idempotency is mandatory

**Decision:** Repeated/retried execution must not duplicate RFQs, approvals, vendor confirmations/rejections, or QuickBooks Purchase Orders.

---

## D018 — Mission Control is the primary UI

**Decision:** Build a polished live execution view rather than a generic admin dashboard.

It should visualize persisted backend state, not calculate business rules independently.

---

## D019 — Speech priorities

**Decision:** Speech-to-text is P1 input polish. Text-to-speech is P2 stretch.

Speech must not be allowed to destabilize the core workflow.

---

## D020 — Pre-hackathon planning provenance

**Decision:** Earlier planning occurred in private `wip-personal/multi-app-hackathon/` before implementation start.

This repository is the implementation-era source of truth from 14 September 2026 Singapore time onward. Do not copy stale planning assumptions back into the build.

---

## D021 — Working name is provisional

**Decision:** Use **Trust Issues** as the working project name. It is not final; naming must not consume build time.

---

## D022 — Clean-sheet implementation

**Decision:** Army of Interns and the existing EA are idea sources only.

**Allowed:** concepts, lessons, failure modes. **Not allowed:** copied code, files, schemas, or taxonomy.

---

## D023 — Foundation stack

**Decision:** Next.js (App Router) + TypeScript + React + Convex, deployed to Vercel later. No UI framework added at bootstrap.

**Convex:** team `dropandreset-main`, project `multi-app-hackathon`. Development deployment `acrobatic-swan-765` is the only environment allowed for normal coding. Preview is not created. Production `proficient-panda-882` exists and is write-protected / out of scope. Identifiers and pinning rules live in `docs/ENVIRONMENTS.md`.

---

## D024 — Product name locked: Somebody

**Decision:** The product is **Somebody** — *"Somebody has to do it. Now Somebody can."* Supersedes D021; the working name Trust Issues is retired.

**Positioning:** Somebody is the autonomous AI coworker that owns messy operational jobs nobody owns. Procurement is the first demonstrated job, not the category. Reliability is the mechanism that makes Somebody dependable, not the headline.

**Consequence:** User-facing UI follows `DESIGN.md` (voice, vocabulary, colour/state semantics, mascot slot, operator layer). Architecture terms (Reliability Core, Role Adapter, Core Worker Contract) stay in architecture docs and code, not primary product UI. No architecture or scope change.

