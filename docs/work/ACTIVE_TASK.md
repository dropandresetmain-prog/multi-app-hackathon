# Active Task

## Current checkpoint

Shared-core generalization is merged to `main`. Do not start the five parallel integration lanes in this chat.

- Original `main`: `966f28d9836cf47b351df3a46a8790cf89dc99c3`
- Candidate branch: `feature/generalize-procurement-core`
- Candidate tip verified: `57dee44328bb8d24c3e9a3be88e87a3a9371356a`
- PR: https://github.com/dropandresetmain-prog/multi-app-hackathon/pull/2
- Merge method: merge commit (history preserved)
- Merge commit / resulting `main`: `bad8f8b88715638ef5d27d925facecf1c5f8a8a8`
- Convex: **Development `acrobatic-swan-765` only**. Production `proficient-panda-882` exists and is write-protected / out of scope. Preview is not created.

`PARALLEL_LANE_BASE_SHA=bad8f8b88715638ef5d27d925facecf1c5f8a8a8`

## Completed product behavior

- [x] Quote request records a deterministic sourcing intent only. Evidence arrives through `ingest_external_evidence`.
- [x] Development fixtures use that same ingest contract (`ingest_fixture_observation` is transport, not domain policy).
- [x] No procurement/domain rule branches on `express` / `studio` / `social` / `catalogue`.
- [x] Endpoint refs are opaque configured identifiers. Model cannot invent recipients. Unknown vendor IDs fail closed.
- [x] Provider-neutral evidence provenance for fixture / web / Gmail / WhatsApp / Instagram.
- [x] `orderQuantity = max(requiredQuantity, MOQ)` without changing the user's required quantity.
- [x] Deterministic ranking by landed cost, then stable vendor-id tie-break. Lower-ranked recommendations are rejected.
- [x] No-viable-option is an explicit recorded result with no invented winner and no commitment effects.
- [x] Communication truth is derived from the latest matching outbound effect lifecycle.
- [x] Evidence provenance must match the configured vendor channel.
- [x] Existing reliability invariants still pass.
- [x] Environment docs record Production `proficient-panda-882` as write-protected.
- [x] Candidate merged to `main` at the SHA above.

## Evidence

Pre-merge promotion verification on Development `acrobatic-swan-765` (Production untouched, no live model call):

- [x] `npm test` — 30/30 PASS.
- [x] `npm run typecheck` / `typecheck:convex` — PASS.
- [x] `npm run convex:codegen` — PASS against Development `acrobatic-swan-765`.
- [x] `npm run build` — PASS.
- [x] `npm run dev:smoke` — PASS (`proof-fcc6e76c-ace8-40ad-ae51-05bb23ff6bbd`, `live=false`, 6 evidence / 1 approval / 8 effects / complete; ranking `studio`).

## Limitations / review decisions

- **Ignore / Accept Risk:** Historical Development missions remain readable via `hydrateMission`. Schema fields added in this milestone are optional so those documents do not block deploys. New missions write the full generalized shape.
- **Park for Later:** Real Gmail / Unipile / web / QuickBooks adapters. The fixture inbound path in `effectAdapter` is the Development stand-in.
- **Park for Later:** Mission Control visual polish.
- **Park for Later:** Production authentication and post-approval human reconciliation.
- **Park for Later:** Safe re-approval after a post-commitment evidence freeze.

## Exact next parallelizable lanes

Not started. Use **fresh chats**, each in its own isolated worktree and branch, all starting from `PARALLEL_LANE_BASE_SHA=bad8f8b88715638ef5d27d925facecf1c5f8a8a8`. Do not rewrite procurement policy.

1. **Google Workspace:** Calendar / Drive context, controlled Gmail bindings, RFQ/reply/clarification with provider message identity, Sheets projection.
2. **Unipile WhatsApp + Instagram:** same effect/evidence contracts.
3. **QuickBooks:** approved PO create + independent read-back.
4. **Web catalogue / search:** real catalogue evidence / Exa if useful.
5. **Somebody chat + voice:** chat-style delegation + later voice input.

Exclude payments, auth product work, extra agents, and any new shared-core policy changes.
