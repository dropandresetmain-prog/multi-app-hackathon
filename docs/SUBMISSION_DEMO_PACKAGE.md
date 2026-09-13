# Somebody — Submission & Demo Production Package

Status: near-final submission/demo package. Final integrated E2E is still pending.

Canonical product identity:

**Somebody**

**Somebody has to do it. Now Somebody can.**

The former working name **Trust Issues** is retired for all product-facing submission work.

## Final-integration placeholders

Replace only after the final merged run is proven:

- `FINAL_BACKEND_SHA`
- `FINAL_FRONTEND_SHA`
- `FINAL_E2E_RESULT`
- `FINAL_VIDEO_LINK`
- `FINAL_RECOMMENDATION_RESULT` — exact winning supplier/result from the final run

Do not invent or pre-fill these.

## Locked product story

Every small company has a mysterious employee called “somebody.”

People say:

- “Can somebody get quotes?”
- “Can somebody chase this?”
- “Can somebody figure out whether this can arrive by Thursday?”
- “Can somebody update the sheet?”
- “Can somebody place the order?”

Those messy operational jobs fall between roles.

Usually, that somebody is you.

Somebody takes ownership of the job across apps, people and changing information, then returns to the human only when judgment or authority is required.

Procurement is the first demonstrated job, not the product category.

## Locked demo scenario

User request:

> Sponsor finally approved $500 for gifts for Thursday. About 25 people. Can you sort out something useful and branded? Maybe tumblers?

The intended job is:

request → gather event context → source/contact suppliers across channels → interpret replies → follow up on missing information → reconcile changed information → compare only valid options → recommend → stop for human approval → confirm/reject suppliers → update Sheets → create QuickBooks Sandbox PO → independently read back external state → only then show verified completion.

## Confirmed implementation state before final integrated E2E

Individually implemented/proven capabilities include:

- Google Calendar: configured event read for timing/location/logistics context.
- Google Drive: bounded folder read for event brief, sponsor and branding context.
- Gmail: real RFQ send, app-owned recipient, provider IDs, idempotent send, read-back, inbound replies, source chronology and superseding later replies.
- Google Sheets: real comparison projection and read-back; Convex remains operational source of truth.
- Web: real public catalogue evidence from Patma, Chibi Stainless Steel Vacuum Tumbler – 500ml. Incomplete public facts stay unknown.
- WhatsApp and Instagram through Unipile: configured bindings, outbound messages, provider IDs, read-back before verified, webhook replies, duplicate protection, own-message filtering, chronology, natural-language extraction and later corrections superseding earlier claims.
- QuickBooks Online Sandbox: approval-gated PO creation/reconciliation, stored entity ID, independent GET/read-back, intended-field verification and stable logical identity to avoid intentional duplicate POs.

Backend integration branch before Google merge:

`integration/backend-providers` at `db760a3a2deb071e7cf89e6790e14a21a0dc9ff8`.

At that checkpoint Web + QuickBooks + Unipile were composed and focused integrated tests were reported as 35/35 PASS.

Do **not** claim the final combined Google + backend + frontend E2E has passed until `FINAL_E2E_RESULT` is supplied.

## Important QuickBooks Sandbox disclosure

The available QuickBooks Sandbox company uses **USD** as its home currency and has multicurrency disabled.

The demo mission is denominated in **SGD**.

For the hackathon, the Sandbox USD amount is used as a proxy to demonstrate the real approval → PO creation → independent read-back procedure.

No FX conversion is implied.

Never claim QuickBooks stored the demo PO in SGD.

---

# 1. Near-final ≤2 minute narration

This is the current master TTS script. Product-facing narration calls the product simply **Somebody**.

> Every small company has a mysterious employee called somebody.
>
> Can somebody get quotes? Can somebody chase this? Can somebody figure out whether this can arrive by Thursday?
>
> Usually, that somebody is you.
>
> So we built Somebody.
>
> A sponsor finally approves five hundred dollars for gifts for Thursday — about twenty-five people, useful, branded, maybe tumblers.
>
> You don't give Somebody a workflow. You just tell it what you need done.
>
> Somebody checks your calendar and event brief, then gets to work.
>
> It checks a real supplier catalogue and contacts suppliers across Gmail, WhatsApp and Instagram.
>
> The catalogue has a real product and price, but not everything needed to make a decision. Somebody leaves the unknowns unknown.
>
> Another supplier gives a price but misses key details, so Somebody follows up instead of guessing.
>
> Then a supplier that looked viable changes an important fact. The new delivery timing misses Thursday.
>
> Somebody keeps the history, replaces the stale claim with the new information, and reranks the options.
>
> Once the evidence is complete, Somebody recommends the best current option — not just the cheapest one.
>
> At that point, it stops.
>
> Research, follow-ups and comparison can happen autonomously. Committing your company still requires you.
>
> Once you approve, Somebody confirms the winner, closes out the others, updates the comparison sheet, and creates a QuickBooks Sandbox purchase order.
>
> But an API saying “success” isn't enough.
>
> Somebody reads the external state back, verifies what actually happened, and only then marks the job complete.
>
> Somebody has to do it.
>
> Now Somebody can.

Target pacing: roughly 1:40–1:50 depending on voice, leaving visual breathing room and a clean close under two minutes.

Do not insert a supplier name or exact winning result until `FINAL_RECOMMENDATION_RESULT` is known.

---

# 2. Precise shot list

The video should be mostly actual product footage. Generated/designed material is limited to the opening, transitions/annotations and closing.

## 0:00–0:09 — Hook / generated asset

**Narration:** “Every small company has a mysterious employee called somebody…” through “Usually, that somebody is you.”

**Show:**

- Somebody mascot / brand card.
- Fast text beats:
  - Can somebody get quotes?
  - Can somebody chase this?
  - Can somebody figure out whether this can arrive by Thursday?
- End on “Usually, that somebody is you.”

**Proof requirement:** none; this is positioning.

## 0:09–0:23 — Handoff / actual product

**Narration:** “So we built Somebody…” through “You just tell it what you need done.”

**Show:**

- Final conversation-first Somebody UI.
- Exact request entered or already visible:
  - sponsor budget $500;
  - Thursday;
  - ~25 people;
  - useful and branded;
  - maybe tumblers.
- Submit/delegate.
- Mascot moves to working state if present.

**Proof requirement:** visible real product surface and mission creation.

## 0:23–0:36 — Context / actual product + very fast external proof

**Narration:** “Somebody checks your calendar and event brief, then gets to work.”

**Show:**

- Mission state/event context populating from Calendar.
- Branding/sponsor/event context from Drive in the product surface.
- If needed, 1-second Calendar and Drive cutaways, then back to Somebody.

**Proof requirement:** visible context derived from real configured Google sources.

## 0:36–0:51 — Multi-app sourcing

**Narration:** “It checks a real supplier catalogue and contacts suppliers across Gmail, WhatsApp and Instagram.”

**Show:**

- Real Patma product page or persisted source evidence.
- Real Gmail outbound RFQ.
- Real WhatsApp outbound RFQ.
- Real Instagram outbound RFQ if fast and legible.
- Return to Somebody showing provider/channel activity.

**Proof requirement:** external app evidence must be genuine, not recreated graphics.

## 0:51–1:06 — Unknown stays unknown / follow-up

**Narration:** “The catalogue has a real product and price…” through “Somebody follows up instead of guessing.”

**Show:**

- Web vendor card with genuine catalogue facts.
- Required fields still visibly unknown/incomplete.
- Contactable supplier with partial reply.
- Somebody marks missing information.
- Real clarification outbound.
- Real supplier clarification reply if timing allows.

**Proof requirement:** price exists while other required facts remain unknown; no fabricated completion.

## 1:06–1:24 — Changing reality / key reliability moment

**Narration:** “Then a supplier that looked viable changes an important fact…” through “reranks the options.”

**Show:**

- Supplier initially viable / attractive.
- Real later reply/correction.
- Old evidence retained in history but visibly superseded.
- Delivery now misses Thursday.
- Supplier becomes ineligible.
- Ranking/recommendation state changes.

**Proof requirement:** authoritative later evidence must visibly change the decision state.

This is the single most important technical sequence in the video. Preserve it even if other integrations are cut for time.

## 1:24–1:39 — Recommendation + authority gate

**Narration:** “Once the evidence is complete…” through “Committing your company still requires you.”

**Show:**

- `FINAL_RECOMMENDATION_RESULT` from final run.
- Concise reason based on current evidence/hard constraints.
- Explicit approval-required state.
- No commitment effects yet.
- Human clicks Approve.

**Proof requirement:** no supplier award / PO before persisted human approval.

## 1:39–1:55 — Execute + verify

**Narration:** “Once you approve…” through “only then marks the job complete.”

**Show:**

- Winning supplier confirmation.
- Non-winner close-out if visually fast.
- Google Sheet projection updating.
- QuickBooks Sandbox PO created.
- Small truthful on-screen note during QuickBooks shot:
  - “Sandbox home currency: USD. Proxy amount used to demonstrate PO workflow; no FX conversion implied.”
- PO initially unverified.
- Independent read-back.
- Effect becomes Verified.
- Job reaches complete.

**Proof requirement:** external write and independent read-back must both be visible.

## 1:55–2:00 — Close / generated asset

**Narration:** “Somebody has to do it. Now Somebody can.”

**Show:**

- Somebody done/verified mascot.
- Wordmark.
- Canonical tagline.

---

# 3. Recording checklist

## Before recording

- Final backend merged and exact `FINAL_BACKEND_SHA` recorded.
- Final frontend merged and exact `FINAL_FRONTEND_SHA` recorded.
- `FINAL_E2E_RESULT` explicitly received; do not infer it from component tests.
- Somebody branding present everywhere judges will see.
- Fresh controlled mission state prepared.
- Calendar demo event exists and contains correct timing/location context.
- Drive bounded demo folder contains the intended event/sponsor/branding context.
- Gmail controlled supplier mailbox logged in and ready.
- WhatsApp controlled supplier account/chat ready.
- Instagram controlled counterparty ready only if used in final cut.
- Patma product page still reachable or valid persisted web evidence available.
- Google Sheet cleared/reset for this recording mission.
- QuickBooks Sandbox logged in; test supplier/item bindings valid.
- Old test PO state cannot be confused with the new mission.
- Convex points to the intended Development/demo deployment only.
- Final model/provider deliberately selected; no accidental free-router model switching if reliability is questionable.
- Browser notifications, OS notifications, Slack, Telegram and personal WhatsApp notifications disabled.
- Personal bookmarks/history/private tabs hidden.
- Clean browser profile if practical.
- 16:9 display, readable zoom and large enough product text for 1080p output.
- Clipchamp project set to 1920×1080.

## During capture

- Capture each important real-app proof as its own clip.
- Capture the supplier correction sequence twice if necessary.
- Capture approval-required state before clicking approval.
- Capture QuickBooks creation and independent verification separately.
- Keep raw recordings; do not overwrite them.
- Do not expose secrets, tokens, provider account IDs or private phone numbers unnecessarily.
- Do not show raw chain-of-thought or internal reasoning.

## Before export

- TTS narration synchronized to real evidence.
- Every capability claim has a visible supporting shot.
- Remove/soften any narration line whose supporting E2E behavior did not survive final integration.
- QuickBooks currency limitation is not misstated.
- Final video remains below 2:00; target 1:55–1:58 maximum after edits.
- Watch the final export at normal size and on phone-sized playback for text readability.
- Upload video and verify the uploaded copy opens without authentication problems.
- Replace `FINAL_VIDEO_LINK` only after verifying it.

---

# 4. Exact screens/apps to have open before recording

Keep these pre-opened and logged in so the capture has no navigation dead time:

1. **Somebody deployed UI / Mission Control** — clean fresh mission state.
2. **Google Calendar** — exact demo event.
3. **Google Drive** — bounded demo folder/event brief/branding asset.
4. **Patma product page** — Chibi Stainless Steel Vacuum Tumbler – 500ml.
5. **Gmail** — controlled supplier mailbox/thread.
6. **WhatsApp** — controlled supplier conversation.
7. **Instagram** — controlled supplier conversation, only if used.
8. **Google Sheets** — final comparison projection.
9. **QuickBooks Online Sandbox** — purchase-order surface / read-back target.
10. **GitHub repo** — available for judges/submission, but not needed in the main video.

Mission Control / Somebody is always the visual home base. External apps are short proof cutaways.

---

# 5. Fallback cut plan

The video should not depend on external APIs responding in real time during a single uninterrupted take.

All fallback clips must still be recordings of the **real implemented behavior**, not recreated fake screens.

## If Instagram is slow or visually weak

Cut it from the narrated app enumeration and rely on Gmail + WhatsApp + Web + Google Workspace + QuickBooks for visible multi-app proof.

Possible narration replacement:

> “It checks a real supplier catalogue and contacts suppliers across the channels they already use.”

## If a supplier reply is slow during recording

Use a pre-recorded real clip of the controlled account receiving/sending that reply, then cut back to the product after webhook ingestion.

## If Calendar/Drive context is slow

Do not dwell on the native Google screens. Show the resulting context inside Somebody and one brief proof cutaway if available.

## If web retrieval is slow

Use a pre-recorded real capture of the Patma page plus the already-ingested source/evidence record. Do not imply the page was fetched at the exact moment shown if the sequence is edited.

## If QuickBooks is slow

Split the real flow into two clips:

1. real PO creation/reconciled entity ID;
2. real subsequent GET/read-back and verified state.

The narration remains accurate because it describes the procedure, not real-time latency.

## If one entire live integration fails final E2E

Remove that integration from narration and from any submission claim of integrated behavior. Keep individually proven integration status in technical notes only if useful and clearly labeled as such.

Do not sacrifice the following sequence:

changed supplier evidence → stale claim superseded → eligibility/ranking changes → human approval → real effect → independent read-back → verified completion.

---

# 6. Final submission description

## Short description

Every small company has jobs that “somebody” has to pick up. Somebody takes ownership of those messy operational tasks across apps, people and changing information, then returns to you only when judgment or authority is actually required.

## Main submission description

Every small company has a mysterious employee called “somebody.”

“Can somebody get quotes?” “Can somebody chase this?” “Can somebody figure out whether it can arrive by Thursday?”

Usually, that somebody is the founder, the ops person, the admin — or you.

Somebody takes ownership of those messy operational jobs end-to-end.

For this hackathon, we demonstrate one last-minute procurement job. A sponsor approves a $500 gift budget only days before an event. The user gives Somebody the outcome, not a workflow.

Somebody gathers existing Calendar and Drive context, checks real public catalogue evidence, contacts suppliers through real business channels, interprets natural-language replies, follows up when information is incomplete, and updates its view when newer supplier information contradicts an earlier answer.

Once the current evidence is sufficient, Somebody recommends the best viable option and stops for explicit human approval before any commitment. After approval, it follows through with suppliers, updates the comparison sheet, creates a real QuickBooks Sandbox purchase order, independently reads external state back, and only then marks the effect verified.

The important part is not procurement itself. Procurement is one example of the cross-functional operational work small teams constantly hand to “somebody.”

Somebody has to do it. Now Somebody can.

## Technical/reliability brief

Somebody uses a real autonomous agent runtime over persistent Convex mission state rather than relying on conversational memory.

The agent can choose how to advance the job, but application-owned rules control business truth, supplier identity, hard constraints, approvals and consequential side effects.

Reliability behavior demonstrated in the procurement flow includes:

- incomplete public catalogue facts remain unknown;
- price alone is not enough to make a supplier comparable;
- contactable suppliers are followed up when required information is missing;
- later authoritative supplier replies supersede stale claims without erasing history;
- options that fail hard constraints such as the deadline become ineligible even when cheaper;
- commitment effects require persisted human approval;
- logical effect identities are stable to reduce duplicate RFQs/POs on repeated execution;
- an external API success is not treated as completion until important state is independently read back and verified.

Final integrated build:

- Backend: `FINAL_BACKEND_SHA`
- Frontend: `FINAL_FRONTEND_SHA`
- E2E: `FINAL_E2E_RESULT`
- Demo: `FINAL_VIDEO_LINK`

### QuickBooks Sandbox disclosure

The QuickBooks Sandbox company available for the hackathon uses USD as its home currency and has multicurrency disabled. The mission itself is denominated in SGD. The Sandbox USD amount is therefore used only as a proxy to demonstrate the real approval → PO creation → independent read-back procedure. No FX conversion is implied, and the submission must not claim that the PO is stored in SGD.

---

# 7. README sections requiring final integration evidence

These sections should be inserted/reconciled on the final submission branch after the integrated E2E report arrives.

## Product overview

Use the product story above. Lead with “Usually, that somebody is you.” Do not lead with reliability-core terminology.

## Demo scenario

Use the final $500 / ~25 people / Thursday / branded-gifts request. Replace `FINAL_RECOMMENDATION_RESULT` with the actual final run result only after it is proven.

## External apps used

Final README should distinguish between:

- apps actually exercised in the final E2E;
- apps individually implemented/proven but omitted from the final E2E/video, if any.

Do not collapse those into one claim.

Candidate integrated app set pending final verification:

- Google Calendar
- Google Drive
- Gmail
- Google Sheets
- Web/public catalogue
- WhatsApp through Unipile
- Instagram through Unipile
- QuickBooks Online Sandbox

## Reliability / evaluation

Insert exact final test evidence, including:

- `FINAL_E2E_RESULT`;
- final relevant test counts;
- exact final backend/frontend SHAs;
- any final manual verification performed;
- real read-back evidence for consequential effects;
- exact remaining limitations.

Retain the QuickBooks USD Sandbox limitation explicitly.

## Setup / architecture

Keep concise:

- Somebody agent runtime;
- Convex as durable operational source of truth;
- integration adapters for Google Workspace, Web, Unipile and QuickBooks;
- human approval boundary;
- external read-back verification.

Do not turn README into an internal architecture document.

## Demo video

Replace with:

`FINAL_VIDEO_LINK`

## Known limitations

At minimum, final README must truthfully capture:

- QuickBooks Sandbox USD home-currency limitation / no implied FX;
- any integration omitted from final E2E;
- demo uses configured/controlled supplier identities rather than arbitrary outbound recipients;
- this is a hackathon demonstration, not a production-ready procurement or payment system.

---

# Final recording gate

Do not record or submit claims based solely on component implementation reports.

The final package is allowed to say the individual integrations are implemented/proven as described above, but it may only say the **combined system works end-to-end** after `FINAL_E2E_RESULT` is explicitly supplied and reconciled.

When that report arrives, update only:

- final backend/frontend SHAs;
- final E2E result/test evidence;
- exact final recommendation/result;
- any integration that did not survive the integrated path;
- final video link;
- narration lines whose visible proof changed.
