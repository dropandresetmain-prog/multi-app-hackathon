# Agent Instructions

Read this file first, then follow the current task ledger in `docs/work/ACTIVE_TASK.md`.

## Authoritative documents

Use these as the current source of truth:

1. `README.md`
2. `PROJECT_BRIEF.md`
3. `ARCHITECTURE.md`
4. `DEMO_SLICE.md`
5. `DECISIONS_LOG.md`
6. `INTEGRATION_PREFLIGHT.md`
7. `docs/ENVIRONMENTS.md`
8. `docs/work/ACTIVE_TASK.md`

Do not rely on older pre-hackathon chat context when these files disagree.

## Scope invariants

- One procurement worker on the critical path.
- Procurement-specific semantics belong in the Procurement Role Adapter.
- The Reliability Core must stay role-agnostic.
- Canonical boundary object: `Core Worker Contract`.
- Convex is the operational SSOT.
- Google Sheets is a user-visible projection, not the machine SSOT.
- Human approval is a hard gate before vendor commitment and Purchase Order creation.
- No payment automation.
- Models do not invent recipient identities or endpoints; application state resolves vendor channels from stable IDs.
- Repeated execution must not duplicate RFQs, approvals, confirmations, rejections, or accounting records.
- Tool/API success is not enough to mark work complete; verify resulting external state.
- Keep `LIVE_AI_ENABLED=true|false` from the first runtime milestone.
- No `DEMO_MODE` flag.
- Prefer free OpenRouter models; OpenAI is fallback if reliability is inadequate.
- Army of Interns and the existing EA are idea sources only; do not copy their code, files, schemas, or taxonomy.

## Convex deployment safety

**Coding agents must name the exact Convex environment and deployment before any write, seed, migration/schema mutation, reset, or destructive action.** Current identifiers and pinning commands live in `docs/ENVIRONMENTS.md`.

- Development: `acrobatic-swan-765` (project `dropandreset-main:multi-app-hackathon`) — the only environment allowed for normal coding.
- Preview: NOT CREATED. Write-protected by convention.
- Production: `proficient-panda-882` exists and is write-protected / out of scope. Do not read or write it from ordinary coding tasks.
- The same Convex team also holds the unrelated `army-of-interns` project; never target it from this repo.

Never use an implicit or assumed Convex deployment.

Any task that can read or write Convex must state and verify:

- environment class: Development, Preview, or Production;
- exact deployment name/identifier;
- whether reads are allowed;
- whether writes are allowed;
- whether schema/seed/destructive operations are allowed.

Before any schema change, seed, reset, destructive action, or data mutation, print/report the active deployment and confirm it matches the task's explicit target.

Development, Preview, and Production are separate databases/state environments and must not be treated as interchangeable.

## Secrets

Keep secrets in local environment variables / platform environment settings. Never commit `.env`, `.env.local`, tokens, OAuth credentials, API keys, refresh tokens, phone numbers, or private account identifiers.

## Scope exclusions unless explicitly reopened

Do not add:

- dynamic workforce creation;
- multi-agent company/org hierarchy;
- payment flows;
- CRM integration;
- generic procurement marketplace features;
- broad browser automation;
- additional messaging providers;
- auth/user-management product work;
- unrelated dashboards or marketing pages.

## Working style

Build the smallest correct version first. Prefer explicit state machines, deterministic identifiers, clear failure states, evidence-backed completion, and narrow interfaces over clever abstractions.

For long work, maintain `docs/work/ACTIVE_TASK.md` as working memory and only check items off after evidence/tests pass.
