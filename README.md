# Trust Issues — Multi-App AI Agent Hackathon

Implementation repository for the Multi-App AI Agent Hackathon.

## Working product

**Trust Issues** is a reliability layer for autonomous workers that take real actions across external systems.

The hackathon demo uses one **Procurement Role Adapter** for a believable last-minute corporate-gifting task:

> A small SME gets sponsor approval for gifts only a few days before a 20–30 person event. The worker must turn a vague request into a procurement brief, source vendors across real channels, reconcile messy quotes, recommend one option, obtain human approval, confirm/reject vendors, and create a verified accounting record.

The product is not a procurement platform. Procurement is the first client of a role-agnostic Reliability Core.

## Locked demo spine

```text
vague request
→ clarify material requirements
→ read Calendar / Drive context
→ source real web vendor + controlled vendors on Gmail / WhatsApp / Instagram
→ collect and clarify quotes
→ normalize and reconcile
→ project comparison to Google Sheets
→ recommend
→ human approval
→ confirm winner / close out others
→ create QuickBooks Sandbox Purchase Order
→ read back and verify
→ completion report
```

No payment automation.

## Architecture

```text
User request
   ↓
Procurement Role Adapter
   ↓
Core Worker Contract
   ↓
Reliability Core
   ↓
Tool adapters / external apps
   ↓
Verified external state
```

Convex is the operational source of truth for workflow state. Google Sheets is a human-readable projection, not the machine SSOT.

## Current integrations

Preflighted before implementation:

- Google Workspace: Gmail, Calendar, Drive, Sheets — PASS
- QuickBooks Online Sandbox — PASS
- Unipile WhatsApp — PASS
- Unipile Instagram — PASS
- OpenRouter — key ready; free models preferred
- OpenAI API — fallback available
- Exa — key ready as controlled web-search/evidence fallback
- Convex — to be created/linked in this repo with explicit environment identifiers
- Vercel — available for deployment

## Scope discipline

Critical path:

- one procurement worker;
- one persisted workflow state machine;
- one vendor state model;
- one hard human approval gate;
- one accounting write with read-back verification;
- explicit idempotency and evidence.

Do not add dynamic worker creation, broad multi-agent orchestration, payments, generic procurement features, extra CRMs, or unrelated app integrations during the hackathon.

## Runtime flags

From the first implementation milestone:

```text
LIVE_AI_ENABLED=true|false
```

Free OpenRouter models are preferred. Direct OpenAI is the fallback if the free route is not reliable enough.

## Documentation

- `PROJECT_BRIEF.md` — product and hackathon scope
- `ARCHITECTURE.md` — implementation architecture and invariants
- `DEMO_SLICE.md` — exact demo direction and acceptance behavior
- `DECISIONS_LOG.md` — settled decisions that should not drift
- `INTEGRATION_PREFLIGHT.md` — integration readiness and remaining build-time proofs
- `docs/work/ACTIVE_TASK.md` — current checkpoint, checklist, and next action

## Provenance

Pre-hackathon ideation was done in the private `wip-personal/multi-app-hackathon/` planning area. This repository begins the actual hackathon implementation on **14 September 2026 (Singapore time)**. Planning concepts were migrated deliberately; implementation code is created here from this point onward.
