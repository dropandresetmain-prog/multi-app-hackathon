# Somebody

**Somebody has to do it. Now Somebody can.**

Every small company has a mysterious employee called “somebody.” Somebody is an autonomous AI coworker for the messy operational jobs that fall between roles: gather context, chase people, reconcile changing information, ask for authority when it matters, take the approved action, and verify that the job actually got done.

**Demo video:** https://youtu.be/hMjTcs8iwvc

---

## What we built

The hackathon brief is simple: build one useful, multi-step AI agent, connect it to at least three external apps, and show how you know it works.

Somebody takes an outcome rather than a hand-built workflow. For the hackathon, we demonstrate that with one procurement job spanning public web data, Google Workspace, WhatsApp, Instagram, QuickBooks, and durable agent state.

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

Procurement is the first demonstrated job, not the product category. The broader idea is operational job ownership: give Somebody the messy task nobody owns, and let it carry the work across systems and people until a real human decision is required.

## The problem

Small teams constantly create work that nobody formally owns:

> “Can somebody get quotes?”  
> “Can somebody chase this?”  
> “Can somebody figure out whether this can arrive by Thursday?”  
> “Can somebody update the sheet?”  
> “Can somebody place the order?”

Usually, that somebody is the founder, the ops person, the admin — or you.

The individual steps are often simple. The hard part is owning the whole job across apps, people, missing information, changing answers, deadlines, approvals, and real-world side effects.

## The hackathon demo

The demo starts with one deliberately vague request:

> “Sponsor finally approved $500 for gifts for Thursday. About 25 people. Can you sort out something useful and branded? Maybe tumblers?”

Somebody then:

1. reads the relevant Calendar and Drive context;
2. checks a real public supplier catalogue;
3. contacts configured suppliers over Gmail, WhatsApp, and Instagram;
4. preserves unknown fields instead of inventing answers;
5. follows up on incomplete quotes;
6. keeps evidence history when a supplier changes an earlier claim;
7. re-evaluates hard constraints and reranks current options;
8. recommends the best current eligible option;
9. stops for explicit human approval before committing the company;
10. after approval, confirms the winner, closes out the other suppliers, updates Google Sheets, and creates a QuickBooks Online Sandbox Purchase Order;
11. reads external state back before treating those actions as verified;
12. only marks the job complete when the required effects are verified.

The point is not “an LLM can call several APIs.” The point is that Somebody owns a job whose truth changes over time without silently guessing, committing without authority, or confusing an API response with real-world completion.

## External apps and systems

This is not a single-app chatbot with decorative integrations. Each connected system contributes a different part of the job.

| System | Role in the demo |
| --- | --- |
| **Google Calendar** | Reads the configured event's timing, location, and logistics context. |
| **Google Drive** | Reads bounded event, sponsor, and branding context from the configured folder. |
| **Gmail** | Sends RFQs and clarifications, retrieves natural-language supplier replies, and preserves message/thread identity and chronology. |
| **Google Sheets** | Projects the current comparison into a human-readable sheet and reads it back. Convex remains the operational source of truth. |
| **Public web** | Uses real catalogue evidence, including Patma's *Chibi Stainless Steel Vacuum Tumbler – 500ml*, with source provenance. Missing public fields remain unknown. |
| **WhatsApp via Unipile** | Sends and receives supplier messages with configured account/chat bindings, provider IDs, dedupe, chronology, and read-back. |
| **Instagram via Unipile** | Supports the same bounded supplier workflow over Instagram messaging. |
| **QuickBooks Online Sandbox** | Creates/reconciles the approved Purchase Order, persists the provider entity ID, then independently reads the PO back before marking it verified. |
| **Convex** | Holds durable mission, evidence, approval, and effect state — the operational system of record. |
| **OpenAI Agents SDK + OpenRouter** | Provides the agent runtime that decides how to progress the bounded job through the available tools. |

Supplier replies do not need machine-readable JSON. Ordinary messages such as:

> “$18 each including logo. Delivery $15. 40 in stock. Thursday morning is fine.”

can be normalized into procurement evidence, including delivery-time interpretation in `Asia/Singapore`.

# System and reliability brief

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
    ├─ Unipile → WhatsApp / Instagram
    ├─ Public Web
    └─ QuickBooks Online Sandbox
    ↓
External read-back
    ↓
Verified state
```

The important boundaries are intentional:

- **Convex is the operational SSOT.** Google Sheets is a user-visible projection, not the machine source of truth.
- **The model does not choose arbitrary recipients.** Application configuration resolves stable vendor IDs to bounded provider endpoints.
- **The model proposes; application policy enforces.** Deterministic logic owns hard constraints, ranking legality, authority, and completion gates.
- **Approval is application state.** The agent cannot approve its own recommendation.
- **Verification is separate from execution.** A provider returning success does not by itself make an effect verified.
- **External evidence has provenance and chronology.** New authoritative observations can supersede older claims without deleting history.

For the deeper design, see [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Reliability rules

Somebody is designed around concrete failure modes rather than a generic “be reliable” prompt:

- **Unknown stays unknown.** An incomplete catalogue page is not promoted into a complete quote.
- **Price alone is not enough.** Required commercial and delivery facts must be sufficient for the decision being made.
- **Hard constraints win.** A cheaper supplier that misses Thursday is ruled out.
- **New evidence supersedes stale evidence.** Older claims remain in history, while the newest authoritative observation becomes current.
- **Changed facts force re-evaluation.** If a supplier changes an earlier delivery promise, eligibility and ranking are recomputed.
- **Post-approval change fails closed.** If new evidence arrives after approval, remaining commitment is frozen for human review rather than silently continuing on stale authority.
- **Human authority is explicit.** No vendor commitment or Purchase Order can happen before persisted approval.
- **Retries are idempotent.** Stable logical effect identities reduce accidental duplicate RFQs, confirmations, and Purchase Orders.
- **Provider identity is bounded by application state.** The model cannot invent recipients or external endpoints.
- **API success is not completion.** External writes remain unverified until the intended state is independently read back.
- **The job completes only after required effects are verified.**

No chain-of-thought is exposed. The UI presents observable evidence, state changes, concise rationale, approvals, and verification state.

## How we evaluated it

The integrated runtime promoted to `main` and deployed to Convex Development was composed at runtime SHA:

`22c3e19743f5f8db99af058de759608ca81fbf68`

The README may receive documentation-only commits after that runtime deployment; no runtime behavior is changed by those documentation updates.

### Integrated candidate gates

| Check | Result |
| --- | --- |
| Root TypeScript typecheck | **PASS** |
| Convex TypeScript typecheck | **PASS** |
| Production build | **PASS** |
| Full automated test suite | **78/78 PASS** |
| Local Somebody UI → `/api/mission` → Convex Development smoke | **PASS** |
| Convex Development deployment | **PASS** — `acrobatic-swan-765` |
| Integrated provider function catalog | **PASS** |
| Unipile HTTP webhook route deployed | **PASS** — POST route exists and rejects unauthenticated requests rather than returning deployment-level 404 |
| Local-only write boundary | **PASS** — cross-origin `/api/mission` requests remain rejected |

### Real provider proofs completed during integration

| Provider path | Evidence established |
| --- | --- |
| Google Calendar | Real configured event read |
| Google Drive | Real bounded folder read |
| Gmail | Real send, read-back, and supplier reply retrieval |
| Google Sheets | Real write and read-back |
| WhatsApp via Unipile | Real outbound messaging and provider read-back; inbound webhook path is deployed on the integrated backend |
| Instagram via Unipile | Real outbound messaging and provider read-back; inbound webhook path is deployed on the integrated backend |
| Public web | Real catalogue retrieval with source provenance |
| QuickBooks Online Sandbox | Real PO create, independent read-back, and idempotent reconcile behavior |

The test suite in [`tests/`](tests/) covers generalized procurement invariants plus Google Workspace, web sourcing/ranking, Unipile messaging, and QuickBooks PO behavior.

A useful detail from the final recording run: when new supplier evidence arrived after human approval, the runtime **froze the remaining follow-through instead of continuing on stale approval**. That is deliberate fail-closed behavior and is one of the reliability properties above.

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

For a configured Development deployment, the safe pattern is to pin the target explicitly and confirm the CLI banner before writing:

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

The interactive control surface is intentionally operated locally for the hackathon demo and talks to the configured Convex Development backend. A public hosted UI is not required to inspect or reproduce the repository.

## Repository guide for judges

If you want to go deeper than the README:

- [`PROJECT_BRIEF.md`](PROJECT_BRIEF.md) — product thesis and hackathon scope.
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — system design, authority boundaries, evidence, idempotency, and verification.
- [`DEMO_SLICE.md`](DEMO_SLICE.md) — procurement demo and acceptance behavior.
- [`DESIGN.md`](DESIGN.md) — Somebody identity, voice, and UI design system.
- [`docs/ENVIRONMENTS.md`](docs/ENVIRONMENTS.md) — deployment targeting and environment safety.
- [`tests/`](tests/) — reliability and provider-focused verification.

## Limitations and demo boundaries

Somebody is a bounded hackathon implementation, not a production procurement or payment system.

- Procurement is the demonstrated job; the product thesis is broader operational job ownership.
- There is **no payment automation**.
- There is no unrestricted supplier-discovery or generic procurement marketplace.
- Controlled supplier accounts and configured endpoint bindings are used so Gmail, WhatsApp, and Instagram flows can be demonstrated safely and repeatably.
- The model is not allowed to invent arbitrary external recipients.
- The QuickBooks Sandbox currency limitation is disclosed above; the USD amount is only a proxy for demonstrating the real approval → PO → read-back flow.
- The frontend write route is deliberately local-only for this Development demo; no public hosted UI is claimed.

---

## Somebody

**Somebody has to do it. Now Somebody can.**
