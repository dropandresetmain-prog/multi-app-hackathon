# Active Task

## Goal

Ship one reliable, presentation-ready multi-app procurement workflow for the Multi-App AI Agent Hackathon.

## Current phase

**Implementation start — bootstrap + Reliability Core + Mission Control UI**

## Current checkpoint

Founder-side integration preflights are effectively complete:

- Google Workspace — PASS
- QuickBooks Sandbox — PASS
- Unipile WhatsApp — PASS
- Unipile Instagram — PASS
- OpenRouter key ready; free-model gate pending
- OpenAI fallback ready
- Exa key ready

The implementation repository is now the source of truth. Pre-hackathon planning remains in `wip-personal`, but stale assumptions should not be imported.

## Critical demo spine

One vague sponsor-gift request → material clarification → Calendar/Drive context → real web vendor + Gmail + WhatsApp + Instagram sourcing → quote clarification/reconciliation → normalized comparison + Sheets projection → recommendation → human approval → vendor outcomes → QuickBooks Sandbox PO → read-back verification → completion.

## Critical constraints

- One procurement worker on the critical path.
- Convex is the operational SSOT.
- Human approval before vendor commitment and PO creation.
- No payment automation.
- No model-invented recipient endpoints.
- Application code owns state transitions.
- Retry-safe/idempotent side effects.
- Tool success is not completion; external verification is required.
- `LIVE_AI_ENABLED=true|false` from the first runtime milestone.
- Prefer free OpenRouter; OpenAI fallback only if necessary.
- Instagram is intended in the main path but may be cut if it materially threatens completion.
- STT is P1; TTS is P2.

## Immediate milestone — foundation + Astra lane

- [ ] Inspect repo and initialize the smallest appropriate Next.js/TypeScript app.
- [ ] Initialize/link Convex in this repository.
- [ ] Record exact Convex Development deployment identifier.
- [ ] Record Preview and Production deployment identifiers when they exist; explicitly state `NOT CREATED` rather than guessing before that.
- [ ] Add deployment safety guidance to environment/config docs as needed.
- [ ] Create `.env.example` containing names only; ensure `.env*` secrets are ignored.
- [ ] Add non-secret `LIVE_AI_ENABLED` handling.
- [ ] Define minimum Core Worker Contract needed by the demo.
- [ ] Define procurement workflow and vendor state machines.
- [ ] Define minimum Convex schema for request/vendor/evidence/communication/approval/effect/event state.
- [ ] Implement effect/idempotency ledger sufficient for critical side effects.
- [ ] Implement approval enforcement.
- [ ] Implement evidence versioning/reconciliation sufficient for later vendor claims to supersede stale claims.
- [ ] Implement verification semantics so unverified effects cannot become complete.
- [ ] Build Mission Control UI from persisted Convex state.
- [ ] Add focused tests for core invariants.
- [ ] Prove local build/typecheck/tests.
- [ ] Commit/push one meaningful checkpoint.

## Minimum Reliability Core tests

- [ ] Incomplete required quote fields cannot become comparable/ready.
- [ ] Hard deadline failure makes a cheaper vendor ineligible.
- [ ] Later authoritative vendor evidence supersedes stale earlier evidence without erasing history.
- [ ] Vendor commitment cannot execute before persisted approval.
- [ ] Duplicate approval/action retries do not duplicate effects.
- [ ] Duplicate PO intent produces one logical accounting effect.
- [ ] API success without read-back verification cannot mark workflow complete.
- [ ] Wrong/unknown vendor endpoint cannot be invented by the model/runtime.

## Next integration milestones after Astra foundation

- [ ] Google Workspace adapter: Calendar/Drive context + Gmail + Sheets projection.
- [ ] Unipile adapter + Convex webhook for WhatsApp and Instagram.
- [ ] QuickBooks Sandbox adapter + create/read-back verification.
- [ ] Web search/catalogue adapter using native web search or Exa boundary.
- [ ] Select and prove free OpenRouter model; wire OpenAI fallback only if needed.
- [ ] Add STT only after critical workflow is stable.

## Storyline work still open

- [ ] Freeze exact event story/date/venue/guest count.
- [ ] Freeze exact gift category/product request.
- [ ] Freeze budget and hard/preferred constraints.
- [ ] Select exact real web Vendor A/catalogue page.
- [ ] Freeze controlled Vendor B/C/D initial replies and clarification replies.
- [ ] Freeze semantic contradiction/stale-evidence moment.
- [ ] Freeze final recommendation outcome.
- [ ] Script exact two-minute demo.

## Completion gate

Do not call the core milestone complete because code exists.

PASS requires:

1. named Convex deployment verified;
2. schema/runtime/UI compile;
3. focused reliability tests pass;
4. Mission Control renders persisted state;
5. invalid approval/effect transitions fail closed;
6. idempotency tests pass;
7. known limitations recorded;
8. checkpoint committed and pushed.

## Current next action

Run the Astra implementation lane against this repository while product/storyline work freezes the exact vendor fixture in parallel.
