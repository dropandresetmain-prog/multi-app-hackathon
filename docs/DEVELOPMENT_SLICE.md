# Procurement Agent / Mission Control

This slice runs one OpenAI Agents SDK Procurement Agent against durable Convex state. Vendor evidence and transport/accounting effects are **Development fixtures**. It does not call Gmail, Google Workspace, Unipile, QuickBooks or web-search APIs.

## Run locally

Requires Node 22.6+ (the Development scripts use Node's environment-file loader).

```powershell
npm install
npm run dev:configure
npm run dev
```

Open `http://127.0.0.1:3000`. The server binds to loopback. `.env.local` must contain the existing Development Convex URL. The configure script verifies `health:status` before creating a random Development capability token and setting the same token locally and on **Development `acrobatic-swan-765`**. It never prints the token or provider key. This capability protects writes; the synthetic mission read surface is public. This is not a production authentication system.

To intentionally enable the live model, put `OPENROUTER_API_KEY` in `.env.local`, then run:

```powershell
npm run dev:configure -- --enable-live
```

This sets `LIVE_AI_ENABLED=true`, `AI_PROVIDER=openrouter`, and `AI_MODEL=openrouter/free` on Development. Set local `AI_MODEL` before running the command only to deliberately select another model. The user-selected default is the free router. Direct OpenAI is a configurable fallback: set `AI_PROVIDER=openai`, `AI_MODEL` and `OPENAI_API_KEY` on the same named deployment; it is never selected silently. No direct OpenAI call was needed for this milestone.

```powershell
npm run dev:configure -- --disable-live
```

Disabling AI prevents new live runs. An already-running request may finish; fixture commands remain available. The UI reads this gate from Convex; a local Next.js flag alone does not enable the scheduled backend worker.

## Demonstrate

1. Create a mission. With live AI enabled, delegation starts the worker automatically. It asks for confirmation of quantity, **total** budget, exact deadline and branding. Confirm the brief to resume it.
2. Watch four channels fill with fixture evidence. Paper & Pine lacks delivery/fee information; the agent chooses a clarification tool before recommending.
3. Before approval, expand Development controls and inject the supplier update. Good Things Studio's delivery moves beyond the hard deadline. Its original price remains valid; its earlier delivery claim is superseded. Resume the worker to get a new recommendation.
4. Approve or reject the current recommendation. The action sends its version; stale browser approvals fail closed. Approval resumes the live worker. No agent tool can approve a recommendation.
5. Watch attempts become unverified successes, then independently verified receipts. Only the application can complete the workflow. Injecting new evidence after approval freezes the mission for review.

With live AI disabled, Development controls expose the same domain actions: collect each quote, clarify Paper & Pine, recommend an eligible option, inject the correction, recommend again, approve, execute each effect, verify each effect, and check completion.

```powershell
npm run dev:fixture
```

Creates a fresh persisted fixture at the second recommendation, ready for approval. Previous missions/evidence remain intact. The UI opens the most recently created mission; internal tooling can read any earlier mission by its key. Fixture values live in `lib/procurement/fixtures.ts` and can change without rewriting domain policy. The canonical example is 25 gifts, SGD 750 total, branding required, and a deadline three days ahead. Other constraints may deliberately produce no viable vendor.

## Boundaries and durable state

- `lib/agent/procurement.ts`: one SDK `Agent` + `Runner`, replaceable model provider and narrow tools. It receives persisted state on each run and after each tool. No durable SDK session, agent swarm, raw reasoning storage or trace export.
- `lib/procurement/domain.ts`: quote sufficiency, landed-cost normalization (integer cents, explicit fees/tax, SGD), hard constraints, field-level source revision reconciliation, recommendation/approval policy, stable recipient resolution and procurement transitions.
- `lib/reliability/core.ts`: the minimal **Core Worker Contract**, transition enforcement, effect authorization, exact receipt comparison and verification-based completion. No quote or vendor semantics.
- `convex/missions.ts`: transactional writes to one bounded mission aggregate. Evidence, approval, recommendation and effect changes share an OCC transaction, closing stale-approval and duplicate-intent races. Limits: 4 configured vendors, 120 evidence records, 80 effects, 20 decisions per mission. Events are separately indexed; UI reads the newest 80.
- `convex/effectAdapter.ts`: explicit attempt → fixture delivery → success acknowledgement, with separate read-back → verification. `fixtureReceipts` is an independent persisted Development transport ledger, **not proof of any real external API effect**. One receipt per effect key under transactional index lookup. Future adapters must implement provider idempotency/reconciliation rather than blindly retry ambiguous sends.
- `convex/agent.ts`: scheduled Node action. Persisted run lease prevents concurrent runs on the same mission, fences stale tools, and permits recovery after interruption. A scheduled five-minute watchdog marks an abandoned run failed; a provider request has a four-minute deadline. Progress survives failures and restarts. There is no automatic retry storm; Resume agent continues from Convex.
- `app/api/mission/route.ts`: bounded command validation, loopback/same-origin control route and server-held Development capability. No secret enters client components. UI confirmation is the Development human decision surface; production identity/authentication is intentionally excluded.

Workflow: `clarifying → sourcing → awaiting_approval → approved → verifying → complete`. Rejection or pre-approval evidence returns to sourcing. Post-approval evidence moves to `blocked`; recovery after a potentially external commitment needs a later explicit human reconciliation flow. History is never erased. Approval is bound to recommendation and evidence versions. All emitted effects, including sourcing, must be verified before completion.

## Checks and evidence

```powershell
npm test
npm run typecheck
npm run typecheck:convex
npm run dev:smoke
npm run dev:smoke:live
npm run build
```

The ordinary smoke creates only Development state; the live smoke deliberately requires the deployed live flag. It proves vague-brief clarification, initial recommendation, reaction to a delivery correction, human approval simulation, effects and fresh-client completion read-back. The script prints the mission key and retains the bounded fixture for inspection.

On 14 September 2026, `openrouter/free` passed the full persisted SDK workflow at mission `live-a6dd97b0-5825-460d-b396-6118dc950a70`: 6 evidence records, 1 approval and 8 verified effects. It used 1 successful tool action for the question, 6 for sourcing/recommendation, 1 for the changed recommendation, and 17 for effects/completion. This is a bounded live proof, not a claim that every free-router backend is reliable. An earlier direct Gemma route returned 429. The router can vary models and availability. No provider failure can bypass domain gates.

## Remaining integration milestone

Next: **Google Workspace sourcing lane**. Resolve the real Calendar/Drive brief, bind a controlled Gmail vendor identity in application state, implement Gmail RFQ + reply/read-back + clarification with stable provider message IDs, and publish the normalized comparison to Sheets. Preserve Convex as SSOT. Prove duplicate/out-of-order replies and ambiguous sends against real external state. Keep vendor commitment and PO creation behind persisted approval. Unipile and QuickBooks remain subsequent narrow lanes.

Before ingesting real sensitive data or hosting publicly, replace the public synthetic read surface and local Development capability with an explicitly scoped access design. This milestone excludes that work, real recipient bindings, external extraction accuracy, payments and public deployment.

SDK wiring follows the official [Agents SDK model/provider documentation](https://openai.github.io/openai-agents-js/guides/models/). The selected free router is documented by [OpenRouter](https://openrouter.ai/docs/guides/routing/routers/free-router).
