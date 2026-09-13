# Architecture

## Goal

Build the smallest role-agnostic reliability layer needed to make one procurement worker trustworthy across real external systems.

The implementation should prove the architecture through the procurement demo without building a generic enterprise workflow engine.

## Dependency direction

```text
User request
    ↓
Procurement Role Adapter
    ↓
Core Worker Contract
    ↓
Reliability Core
    ↓
Tool / integration adapters
    ↓
External systems
```

The Reliability Core must not contain procurement-specific concepts such as MOQ, delivery deadline semantics, gift packaging, or vendor ranking rules. Those belong in the Procurement Role Adapter or its evaluation helpers.

## Runtime shape

```text
                         ┌────────────────────┐
                         │   Mission Control   │
                         │   live Convex UI   │
                         └─────────┬──────────┘
                                   │
                                   ▼
User / voice input → Procurement Adapter → Core Worker Contract
                                   │
                                   ▼
                         Reliability Core
                  ┌────────┼─────────┬──────────┐
                  │        │         │          │
             workflow   effects   evidence   approvals
                state    ledger      /        / gates
                  │        │        /          │
                  └────────┴───────┴───────────┘
                                   │
                      deterministic tool adapters
             ┌─────────────┬────────────┬──────────────┐
             ▼             ▼            ▼              ▼
          Google        Unipile       Web/Exa      QuickBooks
      Workspace APIs  WA + Instagram  / native     Sandbox
                                   │
                                   ▼
                             external state
```

## Source of truth

**Convex is the operational SSOT.**

External systems provide observations, evidence, side effects, and user-facing projections. They do not own the workflow state machine.

Examples:

- Google Sheets = human-readable comparison projection;
- Calendar = event/delivery context and optional resulting delivery appointment;
- Drive = source/evidence files;
- Gmail / WhatsApp / Instagram = communication surfaces;
- QuickBooks = financial system of record after approved PO creation.

## Core Worker Contract

Implement the minimum useful contract for this demo. Initial shape may include:

```text
objective
knownFacts
requiredFacts
constraints
authority
authorizedSideEffects
successConditions
verificationRules
escalationRules
idempotencyScope
```

Do not add fields without a concrete use in the demo or a reliability test.

## Procurement Role Adapter

The adapter owns domain semantics such as:

- what facts must be known before sourcing;
- what quote fields make vendors comparable;
- which fields are hard constraints versus preferences;
- how deadline / MOQ / quantity / landed price / customization are evaluated;
- when a reply needs clarification;
- how stale or conflicting vendor statements are resolved;
- how to construct a recommendation;
- which actions need approval.

## Reliability Core responsibilities

Keep these explicit and small:

1. **Workflow state enforcement** — invalid transitions are rejected.
2. **Evidence ledger** — record what was observed, from which source, and when.
3. **Effect ledger / idempotency** — outbound side effects have stable identities and cannot be duplicated accidentally.
4. **Approval enforcement** — gated effects cannot execute before persisted approval.
5. **Verification** — important side effects require observable read-back or equivalent evidence before completion.
6. **Partial state** — failed/unverified work remains visible and cannot silently become `COMPLETE`.
7. **Reconciliation** — later authoritative evidence may supersede older evidence without erasing history.

## Workflow state machine

Keep one application-owned state machine. Initial candidate:

```text
CLARIFYING_REQUEST
→ SOURCING
→ COLLECTING_QUOTES
→ CLARIFYING_QUOTES
→ READY_TO_COMPARE
→ RECOMMENDED
→ AWAITING_APPROVAL
→ AWARDED
→ PO_RECORDED
→ VERIFIED
→ COMPLETE
```

Failure / unresolved states should be explicit where needed rather than encoded in model prose.

The model may propose actions. Application code owns valid state transitions.

## Vendor state model

Candidate vendor states:

```text
DISCOVERED
→ CONTACTED
→ WAITING
→ NEEDS_CLARIFICATION
→ QUOTE_COMPLETE
→ ELIGIBLE / INELIGIBLE
→ SELECTED / NOT_SELECTED
```

A vendor may move back to `NEEDS_CLARIFICATION` or become `INELIGIBLE` when new authoritative evidence changes its viability.

## Messaging identity invariant

Models never resolve raw communication endpoints.

The model works with stable `vendorId` values. Application state maps each vendor to its configured channel and stable provider identifiers such as email address, Unipile account ID, and chat ID.

## Idempotency

Stable effect keys should exist for at least:

```text
rfq:{requestId}:{vendorId}
clarification:{requestId}:{vendorId}:{questionSetVersion}
approval:{requestId}:{recommendationVersion}
award:{requestId}:{vendorId}
rejection:{requestId}:{vendorId}:{awardVersion}
quickbooks-po:{requestId}:{vendorId}
```

The exact key format may change, but retry behavior must be tested.

## Convex environment safety

Development, Preview, and Production are separate databases/state environments.

Before any write-capable work, the active deployment must be explicitly named and verified. Never rely on implicit CLI state. See `AGENTS.md`.

## UI architecture

Mission Control reads persisted Convex state. It does not independently calculate quote eligibility, recommendation, approval, or workflow transitions.

Required surfaces:

- brief / constraints;
- workflow progress;
- vendor channel + current state;
- evidence / missing fields / contradictions;
- normalized comparison;
- recommendation;
- human approval controls;
- final side-effect verification.

Prefer a polished single-screen execution view over multiple pages.

## Explicit exclusions

Do not build:

- general workflow DSL;
- dynamic multi-agent staffing;
- role marketplace;
- payment engine;
- general procurement catalogue;
- generic CRM;
- browser automation platform;
- parallel messaging-provider abstractions beyond the selected integrations.
