# Unipile WhatsApp + Instagram (this lane)

No secrets in this file.

## Scope

Real Unipile outbound + inbound for configured WhatsApp and Instagram vendors.
Gmail, QuickBooks, web catalogue, and product UI are out of scope.

## Environment (names only)

| Name | Where | Purpose |
| --- | --- | --- |
| `UNIPILE_API_KEY` | local + Convex Development | Unipile API access |
| `UNIPILE_DSN` | local + Convex Development | Unipile host, e.g. `api57.unipile.com:18733` |
| `UNIPILE_WEBHOOK_SECRET` | Convex Development | Auth for public webhook (`?token=` or `x-unipile-webhook-secret`) |
| `UNIPILE_BINDINGS_JSON` | local + Convex Development | Maps opaque `endpointRef` → account/chat/user ids |

Bindings own recipient identity. The model only sees stable `vendorId`.

## Outbound

When credentials + bindings are present, `execute_effect` for WhatsApp/Instagram:

1. records an attempt;
2. sends via `POST /api/v1/chats/{chat_id}/messages` with `account_id`;
3. persists Unipile `message_id` + chat/account ids on `unipileReceipts`;
4. marks the effect **unverified** (API success ≠ verified);
5. `verify_effect` performs independent `GET /api/v1/messages/{message_id}` read-back.

Retries reuse an existing receipt for the effect key and do not intentionally re-send.

Without Unipile config, Development keeps the fixture transport for those channels.

## Inbound claim normalization

1. Optional `SOMEBODY_CLAIMS:{...}` trailer remains a deterministic test/debug fast-path (not required live).
2. Ordinary free-text replies are normalized via:
   - OpenRouter/OpenAI structured JSON extraction when `AI_PROVIDER` + API key + `AI_MODEL` are configured; else
   - bounded natural-language heuristics (amounts, stock, branding, weekday delivery relative to mission deadline).
3. Messages with no extractable quote claims are still ingested with empty `claims` and the raw text preserved for agent visibility — nothing is fabricated.

Weekday/time phrases ("Thursday morning") resolve in `SOMEBODY_TIME_ZONE` (default `Asia/Singapore`), not UTC wall clock. Provider message timestamps and chronology are unchanged.

Endpoint (after a deliberate Development deploy of this branch):

```text
POST https://acrobatic-swan-765.convex.site/webhooks/unipile?token=<UNIPILE_WEBHOOK_SECRET>
```

Unipile dashboard: New messages webhook for WhatsApp and Instagram accounts used by the bindings.

Behavior:

- ignore Somebody’s own outbound (`account_info.user_id` / binding `accountUserId` == `sender.attendee_provider_id`);
- fail closed on unknown account/chat or unbound vendor;
- dedupe on provider `message_id`;
- preserve message id, chat id, account id, and provider timestamp;
- require a controlled claims trailer:
  `SOMEBODY_CLAIMS:{"unitCents":1800,...,"currency":"SGD"}`
- feed normalized evidence through `ingest_external_evidence` only.

## Chronology

`revision = floor((providerTimestampMs - 2024-01-01UTC) / 1000)`.

Later source timestamps win even when older webhooks arrive late or retry. Evidence id is `{provider}:{message_id}`.

## Proven in this lane (2026-09-14)

- Local unit tests for correlation / own-message / dedupe / chronology / outbound idempotency.
- Live Unipile API read-back of connected WhatsApp + Instagram accounts and chat lists (no outbound send without bindings).
- One accidental `convex codegen` sync pushed additive schema/HTTP route to Development `acrobatic-swan-765` (see risks). Do not repeat lane deploys.

## Central verification still required

This lane implements the endpoint and local/provider-boundary tests. Shared Development must not be repeatedly overwritten by parallel lanes. Public webhook proof against Unipile still needs a coordinated deploy of this branch’s HTTP route + env on `acrobatic-swan-765`, then a controlled supplier reply.

## Convex safety

- Development only: `acrobatic-swan-765`
- Production `proficient-panda-882` is out of scope
