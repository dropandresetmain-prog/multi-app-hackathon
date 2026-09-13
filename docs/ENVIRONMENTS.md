# Environments

No secrets in this file. Deployment names and URLs below are non-secret identifiers; deploy keys, admin keys and API keys are never recorded here.

## Hard rule

**Coding agents must name the exact Convex environment and deployment before any write, seed, migration/schema mutation, reset, or destructive action.**

There is no "current Convex database". Development, Preview and Production are separate databases/state environments with separate blast radii. Never infer the target from implicit CLI state (`.env.local`, a previously selected deployment, or `npx convex dev` defaults) — pin it explicitly (see commands below) and confirm the CLI banner/output shows the expected deployment.

## Convex

| Field | Value |
| --- | --- |
| Team | `dropandreset-main` |
| Project | `multi-app-hackathon` (project id `2991239`) |
| Dashboard | https://dashboard.convex.dev/t/dropandreset-main/multi-app-hackathon |
| Region | AWS us-east-1 |

The same team also contains the unrelated `army-of-interns` project. **Never target it from this repo.**

| Environment | Deployment | Reference | URL | Status | Policy |
| --- | --- | --- | --- | --- | --- |
| **Development** | `acrobatic-swan-765` | `dev/dropandreset-main` | https://acrobatic-swan-765.convex.cloud (HTTP actions: `https://acrobatic-swan-765.convex.site`) | CREATED 2026-09-14 | **Allowed for normal coding.** Schema pushes, bounded writes and test data allowed; clean up test data where easy. |
| **Preview** | — | — | — | **NOT CREATED** | Write-protected by convention. Create only via an explicit task (e.g. Vercel preview integration). |
| **Production** | `proficient-panda-882` | `prod` | https://proficient-panda-882.convex.cloud | **CREATED** (write-protected) | **Out of scope for normal coding.** Read-only to coding agents. No seed, reset, schema mutation, or other write from this repo unless an explicit named release task says otherwise. Do not inspect production data during ordinary development. |

Verified 2026-09-14 against Convex tooling: Development `acrobatic-swan-765` and Production `proficient-panda-882` (agent-visible as read-only). No Preview deployment. Production exists and must not be treated as absent.

### Development deployment env vars (names only)

| Name | Set on | Purpose |
| --- | --- | --- |
| `HEALTH_PROBE_WRITES_ENABLED=true` | `acrobatic-swan-765` only | Allows the internal health-probe mutations. Must never be set on Preview/Production. |
| `DEVELOPMENT_ACCESS_TOKEN` | `acrobatic-swan-765` + local server | Random server-only capability for Development commands; never exposed in client code. |
| `LIVE_AI_ENABLED=true` | `acrobatic-swan-765` | Deliberately enabled and live-tested for this slice; set false to prevent new live runs. |
| `AI_PROVIDER=openrouter`, `AI_MODEL=openrouter/free` | `acrobatic-swan-765` | User-selected free model router. |
| `OPENROUTER_API_KEY` | `acrobatic-swan-765` | Existing provider credential; value is never recorded here. |
| `UNIPILE_API_KEY` / `UNIPILE_DSN` | `acrobatic-swan-765` + local | Unipile WhatsApp/Instagram API (values never recorded here). |
| `UNIPILE_WEBHOOK_SECRET` | `acrobatic-swan-765` | Auth for `/webhooks/unipile` (min 16 chars). |
| `UNIPILE_BINDINGS_JSON` | `acrobatic-swan-765` + local | Opaque endpointRef → account/chat/user bindings JSON. |

## Pinning the target

Every write-capable command names the deployment explicitly:

```bash
npx convex run health:status --deployment acrobatic-swan-765
```

```bash
npx convex env list --deployment acrobatic-swan-765
```

For `npx convex dev` (which has no `--deployment` flag), pin with an env file containing only `CONVEX_DEPLOYMENT=dev:acrobatic-swan-765`:

```bash
npx convex dev --once --env-file <path-to-pinned-env-file>
```

Before running, check that the CLI banner reads `[Development] dropandreset-main:multi-app-hackathon:dev/dropandreset-main` and `acrobatic-swan-765`. Stop if it shows anything else.

Do not use `--prod`, `npx convex deploy`, `npx convex import --replace`, or data clearing commands without an explicit task naming Production/Preview and its exact deployment.

## Health surface

Defined in `convex/health.ts` (foundation only — not product schema):

- `health:status` — public read-only query; reports `deploymentName` derived server-side from `CONVEX_CLOUD_URL`, plus `liveAiEnabled` and `probeWritesEnabled`.
- `health:recordProbe` / `health:deleteProbe` — **internal** mutations; refuse unless `HEALTH_PROBE_WRITES_ENABLED=true` on the deployment **and** the caller's `expectedDeployment` matches the deployment actually running the function.
- `health:getProbe` — internal read-back query.

Re-verify Development:

```bash
npx convex run health:recordProbe "{\"expectedDeployment\":\"acrobatic-swan-765\",\"note\":\"probe\"}" --deployment acrobatic-swan-765
```

Then `health:getProbe` with the returned id, then `health:deleteProbe` to clean up.

## Local app

`.env.local` (gitignored) holds `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL` for Development plus local integration secrets. `.env.example` lists names only.

## Vercel

Not yet linked. When linked, record the Vercel project and which Convex deployment each Vercel environment points at here before deploying.
