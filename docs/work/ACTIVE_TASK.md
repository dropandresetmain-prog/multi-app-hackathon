# Active Task

## Current checkpoint

Procurement Agent + Mission Control product slice implemented and verified on 14 September 2026.

- Branch: `codex/procurement-mission-control`.
- Fetched base: `d93f58c3a7fcdd187f9e6e2e6f3654c363e10800`.
- Convex: **Development `acrobatic-swan-765` only**, verified through health tooling before schema and fixture writes.
- Reads, writes, schema changes and bounded Development fixtures allowed. Preview and Production remain NOT CREATED; unrelated projects untouched.
- The foundation milestone is retained in Git history; current runtime/setup details are in `docs/DEVELOPMENT_SLICE.md`.

## Completed product behavior

- [x] One real OpenAI Agents SDK Procurement Agent, with required tool use and domain-owned stopping boundaries.
- [x] Replaceable OpenRouter/OpenAI configuration; user-selected `openrouter/free` live-tested. `LIVE_AI_ENABLED` gates new live runs.
- [x] Minimal role-agnostic Core Worker Contract, transitions, authorization and receipt verification.
- [x] Procurement adapter owns quote sufficiency, explicit fees/tax, landed price, quantity/stock/MOQ/branding/deadline constraints and eligibility.
- [x] Convex mission aggregate, append-only evidence, versioned approvals, stable effects, separate events and independent fixture transport receipts.
- [x] Per-field authoritative evidence reconciliation preserves history and invalidates stale recommendations.
- [x] Persisted human approval gates confirmation, rejection and accounting intent. Agent has no approval or recipient-identity tool.
- [x] OCC-safe duplicate intent/approval/delivery handling; all emitted effects require verification before completion.
- [x] Persisted worker lease, stale-tool fencing, bounded execution and scheduled recovery status.
- [x] Polished Mission Control reads Convex directly; includes new mission, structured brief, vendor history, normalized comparison, approval and effect proof.
- [x] Development controls exercise the same domain rules with live AI disabled; fixture content can be replaced separately.

## Evidence

- [x] 14 focused tests pass, including SDK Runner tool invocation, unknown fees, hard constraints, supersession/conflicts, stale approval refusal, idempotency, endpoint restrictions, verification and local-route origin security.
- [x] Root TypeScript and Convex TypeScript pass.
- [x] Explicit Convex codegen/typecheck and pinned Development schema/function push pass.
- [x] Production Next.js build passes.
- [x] Persisted smoke passes concurrent duplicate approvals and deliveries, refused premature completion, and independent fresh-client read-back.
- [x] Full `openrouter/free` live smoke passes: mission `live-a6dd97b0-5825-460d-b396-6118dc950a70`, 6 evidence records, 1 approval, 8 verified effects, final state complete.
- [x] Updated domain-owned SDK stopping/required-tool path passes a further live router clarification probe.
- [x] Browser creation and brief confirmation successfully persist state and automatically start/resume the worker; it reaches human approval with visible vendor evidence.
- [ ] Final staged secret review and commit/push verification.

## Limitations / review decisions

- **Ignore / Accept Risk:** Free-router availability and model choice vary. A complete live proof passed; explicit resume and persisted failures are available. Deferring a dedicated model benchmark risks demo latency, not bypassing gates.
- **Park for Later:** External integrations, unstructured extraction and production auth are intentionally absent. Use synthetic Development data; public read access is not suitable for sensitive live procurement. Real effects require provider-specific idempotency and read-back implementations.
- **Park for Later:** New evidence after approval freezes the mission. A safe human reconciliation/re-approval flow after a possible commitment is deliberately not improvised here; start another fixture for further demos.
- No payment automation, additional agents, public deployment or new Convex environments.

## Exact next task

Use a **fresh chat** for the Google Workspace sourcing lane. Read PROJECT_BRIEF.md, docs/ENVIRONMENTS.md and docs/DEVELOPMENT_SLICE.md. Implement real Calendar/Drive context, deterministic controlled Gmail vendor bindings, RFQ/reply/clarification with provider message identity and read-back, and the Sheets comparison projection. Preserve the existing domain/approval/effect gates and Convex SSOT. Prove duplicate and out-of-order replies plus ambiguous send recovery. Exclude Unipile, QuickBooks, payments, auth product work and public deployment from that lane.

Start with `lib/procurement/domain.ts`, `lib/procurement/fixtures.ts`, `lib/agent/procurement.ts`, `convex/missions.ts` and `convex/effectAdapter.ts`. Do not redesign the workflow or introduce an agent framework.
