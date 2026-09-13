# Active Task

## Current checkpoint

Procurement Agent + Reliability Core + Mission Control is **complete on `main`**.

- Merged via PR #1 (merge commit, checkpoint history preserved).
- Pre-merge `main`: `d93f58c3a7fcdd187f9e6e2e6f3654c363e10800`.
- Candidate: `codex/procurement-mission-control` @ `97626921e3467e9d9324de8baca2ba1ea0a356b4`.
- Merge commit on `main`: `25166d9cf8ce8de4130b61f3dd457495b285b2fb`.
- Convex: **Development `acrobatic-swan-765` only** for normal coding. Preview and Production remain write-protected by convention; do not target them from this repo.
- Runtime/setup details: `docs/DEVELOPMENT_SLICE.md`. Environment rules: `docs/ENVIRONMENTS.md`.

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
- [x] Mission Control reads Convex directly; includes new mission, structured brief, vendor history, normalized comparison, approval and effect proof.
- [x] Development controls exercise the same domain rules with live AI disabled; fixture content can be replaced separately.
- [x] Candidate integrated into `main` after re-verification (tests, typechecks, codegen, build, bounded Development smoke).

## Evidence (integration re-check)

- [x] `npm test` — 14/14 PASS.
- [x] `npm run typecheck` / `typecheck:convex` — PASS.
- [x] `npm run convex:codegen` — PASS against Development `acrobatic-swan-765`.
- [x] `npm run build` — PASS.
- [x] `npm run dev:smoke` — PASS (`proof-7643fd0f-37f2-457e-9563-9d2fd21f7d61`, `live=false`, 6 evidence / 1 approval / 8 effects / complete).
- [x] Live-model call not re-run for merge; prior recorded live proof retained (`live-a6dd97b0-5825-460d-b396-6118dc950a70`).

## Limitations / review decisions

- **Ignore / Accept Risk:** Free-router availability and model choice vary. A complete live proof already passed; merge did not require another live call.
- **Park for Later:** Current fixtures may couple quote requests directly to fixture evidence. Real-integration lanes will introduce actual external-send / incoming-evidence boundaries.
- **Park for Later:** Real vendor communication state will need effect intent / attempted / sent / verified distinctions beyond a simple `contacted` concept.
- **Park for Later:** External evidence should later preserve real provider identifiers (Gmail message/thread IDs, Unipile message/chat IDs, source URLs, etc.).
- **Park for Later:** Mission Control UI/CSS may be visually large; polish is a later bounded pass, not part of this merge.
- **Park for Later:** Production authentication and post-approval reconciliation remain out of scope.
- **Park for Later:** New evidence after approval freezes the mission; safe human reconciliation/re-approval after a possible commitment is deliberately not improvised here.
- **Investigate Now:** Docs historically recorded Production as NOT CREATED, while Convex MCP currently also lists a read-only prod deployment `proficient-panda-882`. Do not write to it; reconcile documentation vs reality in a follow-up environment audit.
- No payment automation, additional agents, public deployment, or Google Workspace implementation in this checkpoint.

## Exact next task

Use a **fresh chat** for the **real Google Workspace sourcing lane**. Read `PROJECT_BRIEF.md`, `docs/ENVIRONMENTS.md`, and `docs/DEVELOPMENT_SLICE.md`. Implement real Calendar/Drive context, deterministic controlled Gmail vendor bindings, RFQ/reply/clarification with provider message identity and read-back, and the Sheets comparison projection. Preserve the existing domain/approval/effect gates and Convex SSOT. Prove duplicate and out-of-order replies plus ambiguous send recovery. Exclude Unipile, QuickBooks, payments, auth product work, and public deployment from that lane.

Start with `lib/procurement/domain.ts`, `lib/procurement/fixtures.ts`, `lib/agent/procurement.ts`, `convex/missions.ts`, and `convex/effectAdapter.ts`. Do not redesign the workflow or introduce an agent framework.
