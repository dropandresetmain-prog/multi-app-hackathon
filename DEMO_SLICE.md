# Demo Slice

## Status

**LOCKED DIRECTION — last-minute sponsor-funded corporate gifting procurement**

The exact gift, budget and vendor quote values still need final fixture selection, but the workflow and channels are locked enough for implementation.

## Storyline shape

A small SME already has a modest event for roughly **20–30 people** happening in about **three days**.

A sponsor approves a small attendee-gift budget late, creating a believable last-minute procurement task that nobody planned for earlier.

Example user instruction:

> Good news, the sponsor approved some money for gifts for Thursday. Around 25 people, maybe $30 each max. Can you sort something out?

The agent should read existing Calendar / Drive context and ask only clarification questions that materially affect sourcing.

## Locked sourcing paths

### Vendor A — real web catalogue

- real public vendor/product;
- real public source URL and current evidence;
- no vendor outreach;
- expected to be a baseline/non-winner because of a hard constraint such as customization lead time, MOQ, stock or delivery deadline.

### Vendor B — Gmail

- controlled Socius Living email identity;
- agent sends real RFQ through Gmail;
- vendor reply may include a PDF or structured quote;
- agent may send follow-up questions.

### Vendor C — WhatsApp

- controlled second WhatsApp number;
- routed through Unipile;
- reply should be natural/messy enough that follow-up is useful;
- stable Unipile account/chat IDs resolve the endpoint.

### Vendor D — Instagram

- controlled Drop & Reset Instagram counterparty;
- routed through Unipile;
- part of the intended main path, but may be cut if webhook/provider behavior becomes a material reliability blocker during implementation.

## Context apps

### Google Calendar

Use the real event record to infer or verify:

- event date/time;
- venue/location;
- realistic receiving/delivery deadline;
- optionally create a delivery appointment after award.

### Google Drive

Use real files where they improve the story:

- event/sponsor brief;
- logo/branding asset;
- quote PDF or evidence file.

Do not turn Drive into a document-management feature.

### Google Sheets

Create/update a user-visible sourcing comparison. This is an SME-facing artifact, not the operational SSOT.

The sheet should make quote normalization visible and useful outside the Mission Control UI.

### QuickBooks Online Sandbox

After human approval:

- create the Purchase Order;
- independently read it back;
- verify the expected identity/vendor/line data;
- only then mark the accounting side effect verified.

No payment automation.

## Required quote semantics

Final fixture may refine these fields. The comparison should likely cover:

- quantity;
- unit price;
- setup/customization fee;
- delivery fee;
- GST/tax treatment;
- total landed cost;
- customization/branding method;
- MOQ;
- stock/quantity availability;
- confirmed production/lead time;
- confirmed delivery date/time;
- packaging where relevant;
- source/evidence reference;
- latest authoritative version/time;
- missing required fields;
- contradictions.

A vendor is not comparable merely because some price exists.

## Reliability moment

At least one vendor must provide new information that changes the recommendation or eligibility.

Preferred semantic failure:

- vendor initially appears cheapest/viable;
- later authoritative reply changes the delivery date, fee, stock, MOQ, or other hard constraint;
- the system supersedes the stale claim, keeps the evidence history, and reranks/re-evaluates correctly.

This is stronger than a theatrical HTTP 500 because it demonstrates real-world semantic reconciliation.

## Human approval

Recommendation may be autonomous. Commitment is not.

Before approval:

- no vendor is finally confirmed as winner;
- no final rejection is sent as an award outcome;
- no QuickBooks PO is created.

After approval:

- selected vendor is confirmed;
- non-selected controlled vendors are politely closed out;
- Sheets / evidence are updated;
- QuickBooks PO is created and read back;
- final completion report is generated.

## Mission Control UI

Build one polished live execution view.

Suggested hierarchy:

1. **Task brief** — event, quantity, budget, deadline, hard constraints.
2. **Workflow progress/activity** — legible state changes, not raw chain-of-thought.
3. **Vendor cards** — source/channel, status, latest evidence, missing information.
4. **Normalized comparison** — clear visual difference between unknown, invalid and valid.
5. **Recommendation** — winner and concise reason, including why cheaper alternatives lose.
6. **Decision panel** — approve, reject, or ask to negotiate/clarify.
7. **Completion proof** — confirmation/rejections + verified QuickBooks PO + final state.

UI business rules must come from persisted backend state, not frontend-only calculations.

## Speech

- **STT:** P1 polish. Voice input should simply transcribe into the same request flow as typed input.
- **TTS:** P2 stretch only after core demo stability.

## Two-minute demo target

Rough shape:

```text
0:00–0:15  voice/text request + immediate context resolution
0:15–0:40  web + Gmail + WhatsApp + Instagram sourcing begins
0:40–1:05  messy replies / missing fields / clarification / Sheet updates
1:05–1:20  stale or changed evidence causes re-evaluation
1:20–1:35  recommendation + human approval
1:35–1:50  winner/loser communication + QuickBooks PO
1:50–2:00  read-back verification + concise Trust Issues reliability thesis
```

Exact sequencing will be finalized after the fixture and real integrations are wired.

## Hard scope boundary

One vague request → four sourcing paths → normalized decision → one human approval → one verified accounting action.

Everything else is optional polish.
