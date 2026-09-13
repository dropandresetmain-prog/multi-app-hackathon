# Somebody — Submission & Demo Production Package

Status: active submission/demo workstream.

Canonical product identity:

**Somebody**

**Somebody has to do it. Now Somebody can.**

The former working name **Trust Issues** is retired for product-facing submission work.

This file is the working source for positioning, demo narrative, submission copy, judge preparation and recording production. It is intentionally docs-only and does not define product implementation.

> Important: real external-app adapters are being implemented in parallel. Before final recording, re-verify the exact integration status on merged `main` and remove any claim that is not proven end-to-end.

## 1. Verified hackathon constraints

Official event requirements verified on 14 September 2026:

- Build one useful, multi-step AI agent.
- Connect it to at least three external apps.
- Submission closes at 4:00 PM PDT on 13 September 2026, equivalent to 7:00 AM Singapore time on 14 September 2026.
- Submit one project/repository, one demo video and a short system/reliability brief.
- Demo video maximum length: 2 minutes.
- Teams may contain 1–4 people; include every team member's email.
- Judges must be able to access the repository and demo.
- README should cover project overview, external apps used, setup instructions, reliability testing and demo-video link.

Judging weights:

- Technical execution — 30%
- Reliability & evaluation — 25%
- Usefulness — 20%
- Originality — 15%
- Demo clarity — 10%

The submission form itself is linked from the official calendar event. Inventory its exact required fields before final submission.

## 2. Product positioning

### One sentence

Somebody is an autonomous AI coworker for small teams that takes ownership of messy operational jobs across multiple apps and returns to the human only when real authority is required.

### Short description

Small teams constantly create jobs that “somebody” has to pick up. Somebody takes those jobs end-to-end: gathering context, contacting people, reconciling changing information, recommending decisions, requesting approval when needed, and verifying the final outcome.

### Core problem

Every small company has a mysterious employee called “somebody.”

People say:

- “Can somebody get quotes?”
- “Can somebody chase this?”
- “Can somebody figure out whether it can arrive in time?”
- “Can somebody update the sheet?”
- “Can somebody raise the PO?”
- “Can somebody sort this out?”

Usually, “somebody” means the founder, the ops person, the admin, or whoever happens to have capacity.

The actions are rarely difficult individually. The job is difficult because it is fragmented across apps, information sources, external people, waiting, follow-ups, incomplete information, changed information, approvals and real-world side effects.

### Solution

Give Somebody the outcome. Somebody owns the bounded job across the relevant apps, follows through as reality changes, asks the human only when authority or judgment genuinely requires them, and verifies the final result.

### Why now

Models can increasingly use software and call tools. The harder problem is no longer whether an AI can click a button or send a message. It is whether a team can safely hand the AI a real business outcome that unfolds across time, changing information and multiple systems.

### Key differentiator

Somebody is not an assistant that tells the user what to do next. It takes responsibility for progressing the job until a meaningful human decision is required.

### Technical differentiation

The model chooses how to advance the work, but it does not control business truth or authority.

Durable workflow state, evidence history, deterministic eligibility and approval rules, stable recipient identities, idempotent side effects and external read-back verification constrain the agent's actions.

New evidence can supersede stale claims without erasing history. A successful API response is not treated as proof that the intended business outcome occurred.

### Architecture explanation

One autonomous role agent reasons over persistent mission state and uses a narrow tool surface.

Convex owns durable workflow, evidence, approvals and effect state. Domain logic determines quote sufficiency, constraints and ranking. Integration adapters connect the worker to external systems. Important external actions are persisted, gated, executed and independently verified before the workflow can complete.

Do not lead the pitch with this architecture. The architecture is evidence; Somebody is the product.

### Future vision

Procurement is the first demonstration because it combines research, communication, asynchronous people, changing information, financial authority and external side effects in one understandable job.

The same pattern can support other bounded operational work for small teams without turning Somebody into a generic chatbot or workflow builder.

## 3. Recommended demo narrative

The two-minute video should tell one story, not tour the system.

1. Every company has a mysterious employee called “somebody.”
2. A last-minute sponsor-gift job appears.
3. The user delegates the outcome, not a workflow.
4. Somebody gathers context and starts working across apps.
5. A supplier response is incomplete, so Somebody follows up rather than guessing.
6. A previously attractive supplier changes an important fact.
7. Somebody preserves the history, supersedes stale evidence and reranks the job.
8. Somebody recommends the best current viable option.
9. The human approval gate is visibly enforced.
10. After approval, Somebody completes the follow-through.
11. A consequential external effect is independently verified.
12. Close on: **Somebody has to do it. Now Somebody can.**

The supplier correction is the climax. The memorable technical idea should be:

> The world changed, and Somebody changed its mind correctly.

That demonstrates autonomy, evidence, persistence and reliability in one visible moment.

Do not spend the main video on architecture diagrams, raw logs, state-machine names or implementation internals.

## 4. Main timed script

Target final export: approximately 1:55–1:58, always below the official two-minute maximum.

### 0:00–0:07 — Hook

**Narration**

“Every small company has a mysterious employee called somebody.”

**Screen**

Clean Somebody title screen with mascot. Brief text appears: “Can somebody get three quotes?”

**Judge takeaway**

This solves a recognizable business problem, not an AI-demo problem.

### 0:07–0:14 — The problem

**Narration**

“Can somebody chase the supplier? Can somebody sort this out? Usually, somebody means you.”

**Screen**

Two quick examples, then: **So we built Somebody.**

### 0:14–0:25 — Delegate

**Narration**

“A sponsor just approved gifts for an event in three days. I don't give Somebody a workflow. I give it the outcome.”

**Screen**

Mission Control. Submit a request equivalent to:

“Good news, the sponsor approved some budget for gifts for Thursday. Around 25 people, maybe $30 each max. Can you sort something out?”

Keep live-agent status visible where possible.

### 0:25–0:37 — Context and brief

**Narration**

“Somebody checks the existing event context, turns the request into a concrete brief, and starts sourcing.”

**Screen**

Show the structured job: quantity, budget, deadline and branding requirements. If the final build supports it cleanly, briefly show real Calendar/Drive context.

### 0:37–0:51 — Multi-app work

**Narration**

“It works across the channels suppliers already use—Gmail, WhatsApp, the web, and our other business apps.”

**Screen**

Mission Control remains home base. Use very short proof cuts to real external apps that are actually wired in the final build.

At least three distinct external apps must be unmistakably real in the final submission.

### 0:51–1:04 — Missing information

**Narration**

“Paper & Pine gives us a price, but not delivery or the final charges. Somebody doesn't fill in the blanks. It follows up.”

**Screen**

Show incomplete evidence, follow-up, real reply and normalized update.

### 1:04–1:23 — Changing reality

**Narration**

“Good Things is cheaper and looks like the winner. Then the supplier corrects themselves: the branded order can't arrive until the following day.”

Show the real supplier correction, then continue:

“Somebody keeps the old evidence, supersedes the stale claim, and reranks the job.”

**Screen**

A previously viable supplier becomes ineligible. Evidence history remains visible. Recommendation changes.

### 1:23–1:36 — Recommendation

**Narration**

“Now it recommends Paper & Pine. Not because it's the cheapest headline price, but because it's the best current option that actually satisfies the job.”

**Screen**

Recommendation card with concise rationale and current evidence/version state.

The final vendor identity and numbers must match the actual final fixture/live data.

### 1:36–1:44 — Human authority

**Narration**

“Somebody can research, chase and recommend autonomously. Spending company money still requires me.”

**Screen**

Show **Approval required**, then click approve.

### 1:44–1:56 — Finish and verify

**Narration**

“Once approved, Somebody finishes the job: confirms the supplier, updates the comparison, creates the QuickBooks purchase order—and reads it back before claiming success.”

**Screen**

Show the most legible post-approval effects available in the final build. The key sequence is external side effect → read-back → Verified → mission complete.

### 1:56–2:00 — Close

**Narration**

“Somebody has to do it. Now Somebody can.”

**Screen**

Somebody mascot, wordmark and canonical tagline.

## 5. Compressed fallback script

Use this if the full two-minute cut becomes crowded.

### 0:00–0:10

“Every company has a mysterious employee called somebody. ‘Can somebody get quotes?’ ‘Can somebody chase this?’ Usually, somebody means you. So we built Somebody.”

### 0:10–0:22

“A sponsor approved last-minute event gifts. I give Somebody the outcome, not a workflow.”

Delegate and show the structured brief.

### 0:22–0:37

“It starts working across Gmail, WhatsApp and our business systems, gathering real supplier evidence and following up when information is missing.”

Show three unmistakable real-app actions.

### 0:37–0:53

“Good Things looks cheapest—until the supplier changes the delivery date. Somebody keeps the history, rejects the stale information and reranks the options.”

Show correction → vendor becomes ineligible → recommendation changes.

### 0:53–1:04

“It recommends Paper & Pine. But commitment is different from research: nothing gets awarded until I approve.”

Show approval gate → approve.

### 1:04–1:16

“Then Somebody finishes the job, creates the QuickBooks PO and independently reads it back before marking the mission complete.”

### 1:16–1:20

“Somebody has to do it. Now Somebody can.”

## 6. Live pitch opener

“Every small company has a mysterious employee called somebody. ‘Can somebody get three quotes?’ ‘Can somebody chase the supplier?’ ‘Can somebody sort this out?’

The problem is that somebody usually means the founder, the ops person, or whoever has capacity.

We built Somebody: an AI coworker you give the outcome to. It works the job across your apps, comes back when your authority is actually needed, and then finishes what you approved.

Let me show you one job.”

## 7. Video shot list

Mission Control should be the visual home base. External apps appear only as short proof shots.

Required captures:

1. Somebody title/end card.
2. Fresh Mission Control before delegation.
3. Delegation and agent starting.
4. Context resolution if visually useful and genuinely live.
5. Real Gmail RFQ or follow-up.
6. Real WhatsApp outbound/reply.
7. Incomplete quote state in Mission Control.
8. Real clarification reply.
9. Normalized comparison and, if available, Sheets projection.
10. Previously attractive supplier before correction.
11. Real supplier correction.
12. Superseded evidence / vendor becoming ineligible.
13. New recommendation.
14. Approval required → approve.
15. Winner confirmation / non-winner follow-through if clear.
16. QuickBooks PO creation.
17. Independent read-back → Verified.
18. Final complete state.
19. Closing Somebody card.

Production rules:

- Record proof moments separately rather than depending on one perfect two-minute live run.
- Record voiceover after screen capture.
- Use hard cuts or very short dissolves.
- Crop external apps tightly around relevant proof.
- Keep cursor movement deliberate.
- Prefer a 1920×1080 final timeline; record higher resolution if practical.
- Use minimal captions only where comprehension materially improves, e.g. `REAL GMAIL`, `SUPPLIER UPDATED DELIVERY`, `APPROVAL REQUIRED`, `PO VERIFIED`.
- Do not show raw chain-of-thought, internal tool JSON or terminal output in the main video.
- Use the mascot on title card, product identity and closing card; do not create animation risk unnecessarily.

## 8. Submission copy

### Approximately 100 words

Every small company has a mysterious employee called “somebody.”

“Can somebody get quotes?” “Can somebody chase the supplier?” “Can somebody sort this out?”

Usually, somebody means the founder, the ops person, or whoever happens to have capacity.

Somebody is an autonomous AI coworker for that operational work. In our demo, a vague last-minute gifting request becomes a complete procurement job: Somebody gathers existing context, sources suppliers across multiple apps, follows up on incomplete quotes, reconciles changing vendor information, recommends a viable option, requests human approval before commitment, executes the approved outcome, and verifies that the external actions actually happened.

Somebody has to do it. Now Somebody can.

### Longer description

Small teams constantly generate operational work that falls between formal roles.

A sponsor approves something late. A supplier needs chasing. Three quotes need comparing. A spreadsheet needs updating. Somebody needs to make sure the order actually went through.

The individual steps are rarely difficult. The job is difficult because it is fragmented across apps, external people, waiting, missing information, changing information and actions that can have real consequences.

Somebody is an autonomous AI coworker built to own bounded operational jobs end-to-end.

For the hackathon, we demonstrate that through a last-minute procurement job. A user asks Somebody to arrange roughly 25 branded gifts for an event happening in three days. Somebody turns the vague request into a concrete brief, works across the company's existing systems and supplier channels, gathers and normalizes quotes, follows up when information is incomplete, and adapts when a supplier later changes an important delivery commitment.

Once enough current evidence exists, Somebody recommends the best viable option. The human still controls authority: no supplier commitment or purchase order can happen without persisted approval.

After approval, Somebody completes the follow-through and independently verifies important external effects before considering the job done.

The procurement domain makes the reliability problem easy to see, but procurement is not the long-term product. The broader idea is an autonomous operational coworker for the endless jobs inside small companies that “somebody” has to pick up.

Somebody has to do it. Now Somebody can.

## 9. Judge Q&A

### How is this different from Zapier?

Zapier is strongest when the workflow is known in advance: when X happens, perform Y. Somebody is given an outcome and decides what information is missing, who needs a follow-up, whether evidence is sufficient and what action should happen next. Flexible reasoning is agentic; authority, state transitions and consequential side effects remain deterministic.

### How is this different from ChatGPT or general computer-use agents?

Tool access is not the main differentiation. Somebody maintains durable job state across time, remembers the evidence behind decisions, reconciles new information, enforces authority boundaries and verifies consequential external effects. The product is job ownership rather than a general interactive assistant.

### Why procurement?

It compresses many difficult operational-agent problems into one job: multiple apps, external humans, asynchronous replies, incomplete information, conflicting information, deadlines, money and an approval boundary. It is a strong stress test for the broader product.

### Is this actually autonomous?

Yes, within bounded authority. The agent decides what it needs, which configured vendor needs attention, when clarification is required and when enough evidence exists to recommend. It cannot approve its own recommendation or bypass application-owned rules.

### What if the model hallucinates?

The model's statement is not business truth. Vendor facts come from persisted evidence; unknown values remain unknown; recipient identities are configured rather than model-generated; hard constraints and ranking are application-owned; invalid actions fail closed.

### How do you stop it spending money?

Approval is persisted application state tied to a specific recommendation/evidence version. Commitment effects cannot execute before that approval. The hackathon path creates a QuickBooks Sandbox purchase order, not a payment.

### What happens if a vendor changes its answer?

The newer authoritative observation becomes current for the affected field while earlier evidence remains in history. Eligibility and ranking are recomputed. A stale recommendation cannot remain valid against newer evidence.

### Why Convex?

The project needed durable transactional state plus a reactive Mission Control UI quickly. Convex lets the UI update from the same authoritative mission state the worker operates against. The architectural requirement is durable transactional state, not Convex specifically.

### Why an agent instead of deterministic workflow code?

Some parts should be deterministic and are: authority, workflow legality, recipient identity, hard constraints and effect verification. The agent handles ambiguous parts: understanding the request, deciding what information is missing, choosing the next useful tool and communicating with people.

### How does this generalize beyond procurement?

Procurement-specific judgment is separated from the worker reliability layer. Another bounded role can use different domain judgment while reusing persistent state, evidence, authority gates, effect tracking and verification.

### What integrations are real?

Do not freeze this answer until the integration lanes are merged. State only integrations proven in the final end-to-end build. Explicitly label anything still fixture-backed.

### What would you build next?

First harden real adapters: webhook deduplication, ambiguous-send recovery, production authentication and broader evaluation coverage. Add additional bounded operational roles only where real user jobs justify them.

## 10. Proof checklist

### MUST SHOW

- A real agent choosing actions rather than a static sequence.
- At least three unmistakably real external apps in the final submission.
- Autonomous follow-up when a quote is incomplete.
- A real-world information change that alters eligibility or recommendation.
- Evidence history surviving the change.
- A human approval gate before commitment.
- A consequential external side effect.
- Independent verification of that side effect.
- Mission completion only after required proof exists.

### NICE TO SHOW

- Calendar/Drive context retrieval.
- Google Sheets projection.
- Instagram as an additional channel if stable.
- An idempotency retry proving no duplicate effect.
- Evidence version changes.
- Actual supplier attachment/quote evidence.

### EXPLAIN ONLY IF ASKED

- OCC transaction mechanics.
- Run leases/watchdog internals.
- Exact effect-key formats.
- Internal state-machine names.
- Provenance schemas.
- Stale-browser approval mechanics.
- Development mission limits.
- Trace configuration.
- Convex deployment internals.

## 11. Final production checklist

### Repository and submission

- Final integration commits are merged into the branch used for recording.
- Full build/test suite passes after integration, not only in isolated lanes.
- Product-facing surfaces say **Somebody**, not Trust Issues.
- README leads with the product story and contains required submission sections.
- README lists exactly which integrations are live.
- Remaining fixture-backed pieces are clearly labeled.
- Demo-video link is final and publicly accessible.
- Repository opens without the submitter's authenticated session.
- No secrets, private identifiers or `.env` files are committed.
- Submission form fields have been inventoried before the final rush.

### Demo state

- Fresh mission/reset state.
- Controlled Calendar/Drive/Gmail/WhatsApp/Instagram test data prepared as applicable.
- Sheet reset.
- QuickBooks Sandbox authenticated and clean enough to identify the new PO.
- Convex points to the intended Development deployment, never Production.
- At least one full real end-to-end mission has passed on the integrated branch.

### Model

- Live-agent flag intentionally enabled for the recording path.
- Final provider/model deliberately selected.
- If a free model is inconsistent, use the reliable fallback rather than risk the recording.
- Keep a known-good persisted mission as recording backup.

### Recording machine

- Required apps already logged in.
- Personal bookmarks/history hidden.
- Notifications suppressed.
- One clean browser profile.
- 16:9 display.
- Mission Control zoom large enough for 1080p text readability.
- No unnecessary devtools or private windows visible.

### Recording/export

- Record UI clips and voiceover separately.
- Capture the supplier correction carefully; it is the core proof moment.
- Capture PO creation and read-back as distinct proof states.
- Keep raw recordings untouched.
- Final runtime below 2:00; aim 1:55–1:58.
- Export 1920×1080 H.264 MP4 unless the submission form specifies otherwise.
- Speech is clear on ordinary laptop/phone speakers.
- Text is readable without fullscreen.
- Uploaded video and repository links verified in a private/incognito browser.

### Final submission

- Project name: **Somebody**.
- Tagline: **Somebody has to do it. Now Somebody can.**
- Correct team emails.
- Correct repository link.
- Correct final video link.
- Submission descriptions reflect the actual merged build, not planned features.
- Submit before the deadline and retain confirmation evidence.

## 12. Risk triage

### Act Now

- Real external-app lanes must satisfy the at-least-three-app requirement before final recording.
- Somebody branding must replace Trust Issues in product-facing surfaces before final capture.
- README must be reconciled against the final merged implementation.
- Exact submission-form fields must be inventoried.
- Run one full post-integration test/build plus one real end-to-end mission on the final recording branch.

### Investigate Now

- Final model/provider reliability under the recording configuration.
- Unipile inbound webhook behavior if WhatsApp/Instagram appear in the demo.
- Whether QuickBooks read-back proof is visually clear enough for a judge to understand immediately.
- Whether the final real adapters preserve agent choice rather than accidentally encoding a fixed demo script.

### Park for Later

- Voice input if it adds recording risk.
- Instagram if Gmail + WhatsApp + QuickBooks already satisfy the requirement and Instagram remains flaky.
- Animated mascot work.
- Production authentication and production deployment hardening.

### Ignore / Accept Risk

- Procurement is the only implemented role. That is the correct hackathon scope.
- A locally demonstrated or narrowly deployed build is acceptable if the repository and video are accessible and the real app behavior is proven.

## 13. Recording gate

Do not start the final submission recording until all of the following are true:

1. Somebody branding is visible.
2. At least three external apps are wired into the real mission runtime.
3. One complete end-to-end mission has passed on the integrated branch.
4. The supplier-correction/reconciliation moment is reproducible.
5. Human approval is visibly enforced.
6. At least one consequential external effect is independently verified.
7. The final README truthfully describes what is live versus fixture-backed.

The demo should leave judges with one memorable idea:

> Small teams have endless jobs that “somebody” has to pick up. Now Somebody can.
