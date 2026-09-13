# Integration Preflight

## Purpose

Record what has actually been proven before implementation depends on it.

An account existing or an API being enabled is not a pass. A pass requires the application-style flow needed by the demo to have been exercised successfully.

Never commit secrets, tokens, refresh tokens, client secrets, API keys, private phone numbers, or private account identifiers here.

## Current status

| Integration | Status | Proven / Remaining |
| --- | --- | --- |
| Google Workspace | **PASS** | End-user OAuth plus Gmail send/read-back, Calendar create/read-back/delete, Drive create/read-back/delete, Sheets create/write/read-back/delete proven |
| QuickBooks Online Sandbox | **PASS** | Sandbox OAuth, company/realm read, Purchase Order create and independent read-back proven |
| Unipile WhatsApp | **PASS** | Real-account outbound + controlled reply + read-back proven; build-time webhook proof remains |
| Unipile Instagram | **PASS** | Real-account outbound + controlled reply + read-back proven; build-time webhook proof remains |
| OpenRouter | **READY / MODEL GATE PENDING** | fresh key ready; select a free model only after structured output/tool/reconciliation tests pass |
| OpenAI API | **FALLBACK READY** | use only if free OpenRouter route is insufficiently reliable |
| Exa | **READY** | API key ready as controlled web-search/evidence fallback |
| Web catalogue | **BUILD-TIME PROOF PENDING** | choose exact real vendor/product page; retain source URL and public evidence |
| Convex | **SETUP REQUIRED IN THIS REPO** | create/link project; explicitly identify Development / Preview / Production deployments; prove writes only against named target |
| Vercel | **AVAILABLE** | deploy once app exists; prove public UI/webhook paths |

## Google runtime role

- Gmail: controlled Vendor B RFQ/reply/follow-up.
- Calendar: event / venue / delivery deadline context and optional delivery appointment.
- Drive: event/logo/source/quote evidence where useful.
- Sheets: user-visible normalized comparison.

Google Workspace passed its bounded preflight. Do not re-open setup unless implementation exposes a concrete scope/credential mismatch.

## QuickBooks runtime role

Sandbox only.

Critical flow:

```text
approved recommendation
→ create Purchase Order
→ retrieve same Purchase Order independently
→ compare expected identity/vendor/line data
→ mark effect VERIFIED
```

No production company writes. No invoices/bills/payments/banking scope.

## Unipile runtime role

### WhatsApp

Controlled connected account communicates with a controlled second WhatsApp number.

### Instagram

Connected test account communicates with controlled Drop & Reset counterparty.

Stable provider account/chat/message identifiers should be persisted by the runtime rather than resolved from display names on every send.

### Remaining proof

Once Convex exposes the public HTTP endpoint, prove new-message webhooks for both providers and verify:

- incoming human replies are distinguished from the connected account's own outbound messages;
- duplicate/retried webhook delivery is safe;
- message identity is sufficient for deduplication/correlation.

## Web-search strategy

Use one real public vendor/catalogue in the final demo.

Preferred boundary:

```text
search_web(query)
→ source URLs
→ relevant public evidence
→ persisted retrieval timestamp/source
```

Provider may be:

- a capable free OpenRouter model with reliable web-search evidence; or
- direct Exa when explicit search results / source extraction are preferable.

Do not build a generic browser agent.

## Convex environment invariant

Before any write-capable Convex task, record and verify:

- environment: Development / Preview / Production;
- exact deployment name/identifier;
- read permission;
- write permission;
- schema/seed/destructive permission.

Never allow an agent to write to an implicit or assumed deployment.

The implementation should explicitly document all created deployments as soon as Convex is initialized.

## Model gate

Preferred order:

1. free OpenRouter model;
2. direct OpenAI fallback.

Free model must prove enough reliability for:

- structured output;
- tool/action selection;
- quote extraction;
- missing-information detection;
- contradiction/stale-evidence reconciliation;
- recommendation from explicit constraints.

`LIVE_AI_ENABLED=true|false` must exist from the first runtime milestone.
