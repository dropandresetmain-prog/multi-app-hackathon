# Somebody

**Somebody has to do it. Now Somebody can.**

Every small company has a mysterious employee called “somebody.” Somebody is an autonomous AI coworker for the messy operational jobs that fall between roles: gather the context, chase people, reconcile changing information, ask for authority when it matters, take the approved action, and verify that the job actually got done.

**Demo video:** [FINAL_DEMO_VIDEO_URL](FINAL_DEMO_VIDEO_URL)  
**Live UI:** [FINAL_LIVE_UI_URL](FINAL_LIVE_UI_URL)

---

## The problem

Small teams constantly create work that nobody formally owns:

> “Can somebody get quotes?”  
> “Can somebody chase this?”  
> “Can somebody figure out whether this can arrive by Thursday?”  
> “Can somebody update the sheet?”  
> “Can somebody place the order?”

Usually, that somebody is the founder, the ops person, the admin — or you.

The individual steps are often simple. The hard part is owning the whole job across apps, people, missing information, changing answers, deadlines, approvals, and real-world side effects.

## What Somebody does

Give Somebody the outcome, not a hand-built workflow.

```text
Request
  ↓
Gather context
  ↓
Work across apps
  ↓
Contact people
  ↓
Reconcile changing evidence
  ↓
Ask for authority when required
  ↓
Act
  ↓
Read back and verify
```

Somebody keeps the job moving until a real human decision is needed. After approval, it finishes the approved work and checks external systems before claiming success.

Procurement is the first demonstrated job, not the product category.

## The hackathon demo

The demo starts with one deliberately vague request:

> “Sponsor finally approved $500 for gifts for Thursday. About 25 people. Can you sort out something useful and branded? Maybe tumblers?”

That sounds simple until the constraints start interacting:

- total budget;
- quantity;
- minimum order quantity;
- available stock;
- branding requirements;
- delivery deadline;
- setup, delivery, and other charges;
- supplier replies arriving through different channels;
- incomplete information;
- suppliers changing earlier promises.

Somebody turns the request into a usable procurement brief, reads relevant event context, sources and contacts suppliers, normalizes messy replies, follows up when required, rejects options that fail hard constraints, and recommends the best current option.

It then **stops for human approval before any commitment**.

After approval, Somebody follows through with suppliers, projects the comparison to Google Sheets, creates a QuickBooks Online Sandbox Purchase Order, independently reads external state back, and only then marks the required effects verified.

## Multi-app workflow

This is not a single-app chatbot with a few decorative integrations. The job crosses real systems that each contribute part of the operational truth.

| System | Role in the demo |
| --- | --- |
| **Google Calendar** | Reads the configured event's timing, location, and logistics context. |
| **Google Drive** | Reads bounded event, sponsor, and branding context from the configured folder. |
| **Gmail** | Sends RFQs and clarifications, retrieves natural-language supplier replies, preserves thread/message identity, chronology, and read-back proof. |
| **Google Sheets** | Projects the current comparison into a human-readable sheet and reads it back. Convex remains the operational source of truth. |
| **Public web** | Uses real catalogue evidence, including Patma's *Chibi Stainless Steel Vacuum Tumbler – 500ml*, with source provenance. Missing public fields remain unknown. |
| **WhatsApp via Unipile** | Sends and receives real supplier messages with configured account/chat bindings, provider IDs, dedupe, chronology, and read-back. |
| **Instagram via Unipile** | Supports the same bounded supplier workflow over Instagram messaging. |
| **QuickBooks Online Sandbox** | Creates/reconciles the approved Purchase Order, persists the provider entity ID, then independently GETs the PO before marking it verified. |
| **Convex** | Holds durable mission, evidence, approval, and effect state — the operational system of record. |
| **OpenAI Agents SDK + OpenRouter** | Provides the agent runtime that decides how to progress the bounded job through the available tools. |

Supplier replies do not need machine-readable JSON. Ordinary messages such as:

> “$18 each including logo. Delivery $15. 40 in stock. Thursday morning is fine.”

can be normalized into procurement evidence, including delivery-time interpretation in `Asia/Singapore`.

## Why reliability matters

The useful question is not whether an agent can call an API. It is whether a company can safely hand it a job that unfolds across time while the evidence changes.

Somebody is designed around concrete reliability rules:

- **Unknown stays unknown.** An incomplete catalogue page is not promoted into a complete quote.
- **Price alone is not enough.** Required commercial and delivery facts must be sufficient for the decision being made.
- **Hard constraints win.** A cheaper supplier that misses Thursday is ruled out.
- **New evidence supersedes stale evidence.** Older claims remain in history, while the newest authoritative observation becomes current.
- **Changed facts cause re-evaluation.** If a supplier changes an earlier delivery promise, eligibility and ranking are recomputed.
- **The model proposes; application policy enforces.** Hard constraints, approval requirements, recipient identities, and verification rules are not left to free-form model reasoning.
- **Human authority is explicit.** No vendor commitment or Purchase Order can happen before persisted approval.
- **Retries are designed to be idempotent.** Stable logical identities reduce accidental duplicate RFQs and duplicate Purchase Orders.
- **API success is not completion.** An external write remains unverified until the intended state is independently read back.
- **The job completes only after required effects are verified.**

No chain-of-thought is exposed. Judges see evidence, state changes, concise rationale, approvals, and external proof.

## Architecture

```text
Somebody UI
    ↓
Procurement Agent
    ↓
Reliability + procurement policy
    ↓
Convex operational state
    ↓
Provider adapters
    ├─ Google Workspace
    ├─ Unipile
    ├─ Public Web
    └─ QuickBooks
    ↓
External read-back
    ↓
Verified state
```

A few boundaries matter:

- **Convex is the operational SSOT.** Google Sheets is a user-visible projection, not the machine source of truth.
- **The model does not choose arbitrary recipients.** Application configuration resolves stable vendor IDs to bounded provider endpoints.
- **Approval is application state.** The agent cannot approve its own recommendation.
- **Verification is separate from execution.** A provider returning success does not by itself make an effect verified.
- **Hard constraints live outside free-form reasoning.** The model can decide how to advance the work, while deterministic application logic owns eligibility, ranking constraints, authority, and completion gates.

For more detail, see [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Evidence / what we tested

The current integrated backend candidate is:

- branch: `integration/backend-providers`
- current candidate SHA: `a93227b6fb1d64c3f6dd98bf1f6b2907729b4f28`
- final backend SHA: `FINAL_BACKEND_SHA`
- final frontend SHA: `FINAL_FRONTEND_SHA`

Provider and integration work already proved the following before the final live end-to-end run:

| Check | Current evidence |
| --- | --- |
| TypeScript typecheck | **PASS** |
| Convex typecheck | **PASS** |
| Web + ranking + QuickBooks + Unipile focused tests | **35/35 PASS** |
| Google Workspace focused tests | **8/8 PASS** |
| Google Calendar | Real configured event read proven |
| Google Drive | Real bounded folder read proven |
| Gmail | Real send, read-back, inbound reply retrieval proven |
| Google Sheets | Real write and read-back proven |
| WhatsApp via Unipile | Real send, reply, and read-back proven |
| Instagram via Unipile | Real send, reply, and read-back proven |
| Public web | Real catalogue retrieval with provenance proven |
| QuickBooks Online Sandbox | Real PO create, read-back, and idempotent reconcile path proven |

Relevant tests live in `tests/`, including the generalized procurement invariants, Google Workspace, web sourcing/ranking, Unipile messaging, and QuickBooks PO tests.

**Final integrated live E2E:** `FINAL_E2E_RESULT`

Until that placeholder is replaced, the table above should be read as provider/integration proof — not a claim that the final combined live mission has already passed.

## QuickBooks Sandbox note

The available QuickBooks Sandbox company uses **USD** as its home currency and has multicurrency disabled, while the demo procurement mission is denominated in **SGD**.

For the hackathon, the Sandbox USD amount is used as a **proxy** to demonstrate the real:

```text
human approval
→ Purchase Order creation/reconciliation
→ provider entity ID persistence
→ independent GET/read-back
→ verified effect
```

No FX conversion is implied. We do **not** claim that QuickBooks stores the demo Purchase Order in SGD.

## Run locally

### Requirements

- Node.js **>= 22.6.0**
- npm
- a Convex account/project for persistent operational state

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local` and supply your own values. The repository contains variable **names only**; credentials and tokens must remain outside Git.

For Convex, read [`docs/ENVIRONMENTS.md`](docs/ENVIRONMENTS.md) before any write-capable command. Development, Preview, and Production are separate environments; do not rely on implicit CLI state.

For this repository's configured Development deployment, the safe pattern is to pin the target explicitly and confirm the CLI banner before writing:

```bash
npx convex dev --once --env-file <path-to-pinned-env-file>
```

Then start the app:

```bash
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run typecheck:convex
npm test
npm run build
```

Reproducing every real external integration requires your own Google Workspace, Unipile, QuickBooks Sandbox, model-provider, and related credentials/accounts. See `.env.example` and [`docs/ENVIRONMENTS.md`](docs/ENVIRONMENTS.md) for the required configuration names and environment policy.

## Repository guide

If you are judging the project, these are the useful next reads:

- [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md) — product thesis and hackathon scope.
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — system design, authority boundaries, evidence, idempotency, and verification.
- [`DEMO_SLICE.md`](DEMO_SLICE.md) — the procurement demo and acceptance behavior.
- [`DESIGN.md`](DESIGN.md) — Somebody identity, voice, and UI design system.
- [`docs/ENVIRONMENTS.md`](docs/ENVIRONMENTS.md) — deployment targeting and environment safety.
- [`tests/`](tests/) — reliability and provider-focused verification.

## Limitations and demo boundaries

Somebody is a bounded hackathon implementation, not a production procurement or payment system.

- Procurement is the demonstrated job; the product thesis is broader operational job ownership.
- There is **no payment automation**.
- This is not a broad generic procurement marketplace or unrestricted supplier-discovery product.
- Controlled supplier accounts and configured endpoint bindings are used so email, WhatsApp, and Instagram flows can be demonstrated safely and repeatably.
- The model is not allowed to invent arbitrary external recipients.
- The QuickBooks Sandbox currency limitation is disclosed above; the USD amount is only a proxy for demonstrating the real approval → PO → read-back flow.
- Final combined live integration evidence is represented by `FINAL_E2E_RESULT` until the last end-to-end run is complete.

---

## Somebody

**Somebody has to do it. Now Somebody can.**
