# Project Brief

Working name: **Trust Issues** — provisional.

## Product thesis

Current autonomous agents can call tools successfully while still failing to complete the actual real-world job correctly.

This project builds a **general Reliability Core for autonomous workers**. Role-specific professional judgment lives in **Role Adapters**. The canonical boundary between role-specific interpretation and reliable execution is the **Core Worker Contract**.

Central principle:

> A model, worker, or successful API response does not get to declare the job complete. Completion must be supported by observable evidence against explicit success conditions.

## Hackathon demo

The first Role Adapter is **Procurement**.

Demo domain: **last-minute corporate gifting** for a small SME without dedicated procurement/admin capacity.

Believable scenario shape:

- an event for roughly 20–30 people is already happening in about three days;
- sponsor budget for attendee gifts is approved late;
- the user gives a vague instruction rather than a procurement specification;
- the agent must infer available context from Calendar/Drive, ask only material clarification questions, and handle the annoying sourcing work end to end.

The exact gift/product and vendor values are still to be frozen, but the event should be small enough that last-minute approval is believable.

## Human workflow being replaced

```text
boss gives vague ad-hoc request
→ employee clarifies requirements
→ searches vendors
→ contacts suppliers across fragmented channels
→ waits/chases replies
→ normalizes inconsistent quotes
→ checks deadline/requirements
→ recommends one
→ gets approval
→ confirms/rejects vendors
→ updates accounting
```

## Intended sourcing paths

- **Vendor A — Web:** real public vendor/catalogue with real source URL and public evidence; expected baseline/non-winner; no real outreach.
- **Vendor B — Gmail:** controlled vendor identity through the Socius Living email account.
- **Vendor C — WhatsApp:** controlled second WhatsApp number through Unipile.
- **Vendor D — Instagram:** controlled Drop & Reset Instagram counterparty through Unipile.

The people may be simulated by the builder. The app integrations must be real.

Instagram is part of the intended main path, not a stretch goal (see `DECISIONS_LOG.md` D007 for the narrow cut rule).

The final judged path must use at least three genuine external apps meaningfully; apps are included because the work spans them, not for app count.

## Other app roles

- **Google Calendar:** event date, venue, receiving window, delivery deadline/context; may also record delivery appointment after award.
- **Google Drive:** event brief, sponsor/logo assets, quote evidence/files where useful.
- **Google Sheets:** human-readable normalized procurement comparison for SME users.
- **QuickBooks Online Sandbox:** approved Purchase Order creation and independent read-back verification.
- **Convex:** operational workflow SSOT.
- **OpenRouter:** preferred model runtime using free models where reliable.
- **OpenAI:** model fallback if free OpenRouter route is inadequate.
- **Exa:** controlled search/evidence fallback when native model web search is insufficient or less inspectable.

## Approval boundary

Sourcing, clarification, normalization, evidence gathering, and recommendation may be autonomous.

Human approval is mandatory before:

- accepting/confirming the winning vendor;
- rejecting alternatives as a final award outcome where that communication represents a committed decision;
- creating the accounting-side Purchase Order.

No payment automation.

## Reliability behaviors to prove

The demo should visibly show several of the following:

- information sufficiency before comparison;
- deadline and other hard constraints evaluated separately from headline price;
- later authoritative vendor information superseding stale earlier claims;
- stable vendor identities rather than model-invented recipients;
- hard approval gating;
- idempotent retries / duplicate prevention;
- external-state verification after side effects;
- partial/unresolved states remaining visible instead of being reported as complete;
- human-readable evidence and source references.

## Scope discipline

The project is **not** a procurement platform and should not become one during the hackathon.

Build:

- one Procurement Role Adapter;
- one Reliability Core sufficient for this demo;
- one workflow state machine;
- one vendor state model;
- one Mission Control UI;
- only the integrations required for the locked workflow.

Do not recreate Army of Interns' dynamic staffing, audience-dependent roles, worker promotion/lifecycle, multiple transport fallbacks, or unrelated product surfaces.

## Demo UX

The primary UI is a compact **Mission Control** execution view, not a generic admin dashboard.

It should make the workflow legible at a glance:

- current procurement brief;
- current workflow state/activity;
- vendor cards filling in as evidence arrives;
- missing/contradictory fields;
- normalized comparison;
- recommendation and rationale;
- approve / reject / negotiate action area;
- final proof of communications and verified QuickBooks PO.

Speech-to-text is P1 input polish. Text-to-speech is P2 stretch.
