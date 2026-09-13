# Active Task

## Current checkpoint

Targeted review fixes on `feature/generalize-procurement-core`. Not merged to `main`.

- [x] Communication state is the latest outbound effect, not the highest lifecycle rank.
- [x] Evidence provenance must match the configured vendor channel.

- Base `origin/main` verified: `966f28d9836cf47b351df3a46a8790cf89dc99c3`.
- Branch: `feature/generalize-procurement-core`.
- Convex: **Development `acrobatic-swan-765` only**. Production `proficient-panda-882` exists and is write-protected / out of scope. Preview is not created.

## Completed product behavior

- [x] Quote request records a deterministic sourcing intent only. Evidence arrives through `ingest_external_evidence`.
- [x] Development fixtures use that same ingest contract (`ingest_fixture_observation` is transport, not domain policy).
- [x] No procurement/domain rule branches on `express` / `studio` / `social` / `catalogue`.
- [x] Endpoint refs are opaque configured identifiers. Model cannot invent recipients. Unknown vendor IDs fail closed.
- [x] Provider-neutral evidence provenance for fixture / web / Gmail / WhatsApp / Instagram.
- [x] `orderQuantity = max(requiredQuantity, MOQ)` without changing the user's required quantity.
- [x] Deterministic ranking by landed cost, then stable vendor-id tie-break. Lower-ranked recommendations are rejected.
- [x] No-viable-option is an explicit recorded result with no invented winner and no commitment effects.
- [x] Communication truth is derived from effect lifecycle: none / pending / attempted / unverified / verified.
- [x] Existing reliability invariants still pass.
- [x] Environment docs record Production `proficient-panda-882` as write-protected.

## Evidence

- [x] `npm test` — 28/28 PASS.
- [x] `npm run typecheck` / `typecheck:convex` — PASS.
- [x] `npm run convex:codegen` — PASS against Development `acrobatic-swan-765`.
- [x] `npm run build` — PASS.
- [x] `npm run dev:smoke` — PASS (`proof-3577ec08-0b65-4142-af68-18ff133af300`, `live=false`, 6 evidence / 1 approval / 8 effects / complete; ranking after update: `studio`).
- [x] Live-model call not run for this refactor. Deployment already had `LIVE_AI_ENABLED=true`; secrets were not modified.

## Limitations / review decisions

- **Ignore / Accept Risk:** Historical Development missions remain readable via `hydrateMission`. Schema fields added in this milestone are optional so those documents do not block deploys. New missions write the full generalized shape.
- **Park for Later:** Real Gmail / Unipile / web / QuickBooks adapters. The fixture inbound path in `effectAdapter` is the Development stand-in.
- **Park for Later:** Mission Control visual polish.
- **Park for Later:** Production authentication and post-approval human reconciliation.
- **Park for Later:** Safe re-approval after a post-commitment evidence freeze.

## Exact next parallelizable lanes

Use **fresh chats**. Do not rewrite procurement policy.

1. **Google Workspace:** Calendar / Drive context, controlled Gmail bindings, RFQ/reply/clarification with provider message identity, Sheets projection.
2. **Unipile:** WhatsApp / Instagram through the same effect/evidence contracts.
3. **Web:** real catalogue evidence / Exa if useful.
4. **QuickBooks:** approved PO create + independent read-back.
5. **Product UI:** chat-style delegation + later voice input.

Start from `lib/procurement/domain.ts`, `convex/effectAdapter.ts`, and `ingest_external_evidence`. Exclude payments, auth product work, extra agents, and merging this branch to `main` until review.
