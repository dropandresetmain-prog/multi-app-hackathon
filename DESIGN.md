# DESIGN.md — Somebody

The design system for every user-facing surface of **Somebody**. Read this before building or changing UI. When it disagrees with older UI code or earlier "Trust Issues" material, this file wins.

Implementation lives in:

| Concern | File |
| --- | --- |
| Tokens + component styles | `app/globals.css` |
| State → words, tone, pose (pure, tested) | `app/somebody/presentation.ts` · `tests/presentation.test.ts` |
| Mission Control screen | `app/MissionControl.tsx` |
| Mascot slot | `app/somebody/Mascot.tsx` |
| Icons | `app/somebody/Icon.tsx` |
| Operator (demo) controls | `app/somebody/OperatorDrawer.tsx` |
| Fonts + page title | `app/layout.tsx` |

---

## 1. Identity

**Somebody**
*Somebody has to do it. Now Somebody can.*

Small teams generate messy operational work that doesn't cleanly belong to anyone. "Can somebody get quotes for this?" "Can somebody chase the supplier?" Somebody is the AI coworker who takes the job. You hand over the outcome, and Somebody drives it across apps, people and changing information. It comes back only when it needs your judgment or authority, then finishes and checks the result.

- Procurement is the **first job we demonstrate**, not the product category. Don't design procurement-platform chrome.
- Reliability is **how** Somebody is dependable. It is not the headline. Show it as behaviour: unknowns stay unknown, changes are caught, approval is required, results are read back. Don't label it with architecture terms.
- There is **one** Somebody. No worker lists, org charts, avatars for multiple agents, or "team" metaphors.

### The screen should make these eight things obvious without narration

1. You handed Somebody a messy job.
2. Somebody owns it and is actively working.
3. Somebody works across several apps and channels.
4. Somebody keeps track of information that changes.
5. Somebody knows what it may do alone.
6. Somebody stops when your authority is needed.
7. After you approve, Somebody finishes the job.
8. Somebody checks that it actually happened.

If a UI change makes any of these harder to see, it's the wrong change.

---

## 2. Character and voice

Somebody is **mildly weary, extremely competent, dependable, fast and calm in a mess**. It quietly gets things done while cleaning up after everyone else. It is never sarcastic, angry, cynical, chaotic or incompetent. The humour comes from the situation (a sponsor approving a gift budget three days out), not from snarky lines.

### Voice rules

- **Plain, short, specific.** "Arrives after the deadline", not "Delivery misses the hard deadline constraint".
- **Say what happened, then what's next.** "Good Things Studio changed their quote. Somebody is re-checking the options."
- **Calm when things go wrong.** "Somebody stopped", not "ERROR" or "FAILED".
- **Use "Somebody" where it adds ownership**, usually in headlines and at key moments. Don't put it in every sentence; "Waiting for reply" doesn't need it.
- **Address the human as "you".** "Needs your approval", "Approved by you".
- **No exclamation marks, no emoji, no cutesy filler.** Dry understatement is fine: "Nothing on the table fits the brief."
- **Never expose model reasoning.** Show outcomes, evidence and short rationales only.
- **Sentence case everywhere.** Uppercase is only for small kickers and eyebrows (CSS `text-transform`).

### Vocabulary

Internal terms belong in `ARCHITECTURE.md` and code, not the primary UI.

| Internal / engineering | Say in the product |
| --- | --- |
| Mission | Job |
| Delegate mission | Give Somebody the job |
| Procurement Agent / worker / run | Somebody |
| Agent running | Somebody is working |
| Requirements / brief | What you asked · the brief |
| `clarifying` / ask_requirements | Somebody needs a couple of details |
| Evidence ingested | *Vendor* sent new information |
| Superseded evidence / claim | Changed (was → now) |
| Conflicting claims | Conflicting info |
| `needs_clarification` | Missing details · Following up |
| `eligible` | Viable |
| `ineligible` | Ruled out + the reason in plain words |
| Ranking / top-ranked | Ranked #1 |
| Recommendation + rationale | Somebody recommends … · Why Somebody recommends this |
| Approval gate | Needs your approval · Nothing is committed until you approve |
| Effect (rfq, clarification…) | Quote request · Follow-up question · Order confirmation · Close-out note · Purchase order |
| Effect ledger | Every message and record |
| attempted / unverified | Sending · Sent · checking |
| Verified (read-back) | Verified · read back |
| `complete` | Done and verified |
| `blocked` | Somebody stopped |
| No viable option | Nothing on the table fits the brief |
| Reliability Core, Role Adapter, Core Worker Contract, state machine | **Not shown in the product UI** |

Backend strings that still use engineering wording go through `humanize()` in `presentation.ts`. The raw string remains available as a tooltip. Unknown strings pass through unchanged. Long term, this copy should move into the backend messages themselves.

---

## 3. Colour

One rule carries the whole palette:

> **Orange means Somebody. Every other colour describes the state of the world.**

Orange appears wherever Somebody is present or acting: the wordmark dot, the "working" pulse, the active progress step, the mascot slot and "Somebody" entries in the activity log. Orange is never used for data states, so a glance at colour tells you "Somebody is acting" versus "this is what's true".

### Surfaces and ink

| Token | Value | Use |
| --- | --- | --- |
| `--paper` | `#f4f1ea` | Page ground (warm office paper) |
| `--paper-sunk` | `#ebe6db` | Sunken wells, counters |
| `--surface` | `#fffdf9` | Cards |
| `--line` / `--line-strong` | `#e3ddd1` / `#cec6b7` | Hairlines / dashed unknowns, inputs |
| `--ink` | `#1d1b18` | Primary text, primary buttons, completed steps |
| `--ink-2` | `#4f4a42` | Secondary text |
| `--ink-3` | `#726c62` | Meta text (min 12px) |
| `--somebody` / `-ink` / `-wash` | `#e4602a` / `#b0451a` / `#fde9de` | Brand presence (see rule above) |

### State tones

Every state uses a three-part tone: `--tone` (dot, bar, border), `--tone-ink` (text) and `--tone-wash` (background). Apply one with a `.tone-<name>` class, and components read `var(--tone*)`. **Never hard-code state colours in components.**

| Tone | Means | Visual signature | Typical sources |
| --- | --- | --- | --- |
| `unknown` | Not known yet. Somebody doesn't guess. | **Dashed** outline, hollow dot, `?` chip, italic "Not confirmed" | Missing quote fields, unconfirmed brief facts, vendor not contacted / not checked, queued effects |
| `waiting` | Somebody acted and is waiting on someone else. | Blue, animated typing dots | Quote requested with no reply, following up, sending / sent · checking |
| `viable` | Meets every hard requirement. | Green bar and dot | `evaluation.status === "eligible"` |
| `ineligible` | Fails a hard requirement. | Brick red bar; failing cell highlighted | `evaluation.status === "ineligible"`, no viable option, stopped |
| `changed` | Newer information replaced something we relied on. | Violet strip, ~~was~~ → **now**, violet underline in table | `supersededClaims` whose value actually differs, conflicts |
| `decision` | Your judgment or authority is needed. | **Highlighter yellow**: filled pill, `<mark>` on the name, yellow panel border | Awaiting approval, brief questions |
| `verified` | It happened and Somebody read it back. | **Solid** deep green fill, white text, check, stamp | Effect `status === "verified"`, selected vendor, done |
| `neutral` | No longer relevant. | Grey, reduced opacity | Vendors not selected after approval |
| `somebody` | Somebody is working (not a data state). | Orange | Live headline, activity "Somebody" entries |

Rules:

- **Viable vs verified must never look alike.** Viable is an outline, bar or wash. Verified is a solid fill. "Could work" and "did happen" are different claims.
- **Unknown is never zero.** A missing fee shows `?`, never `$0.00`.
- **Changed never erases history.** Show the old value struck through and keep the message history expandable.
- **Yellow is reserved for the human.** If nothing is waiting on the user, nothing on screen is yellow.
- Red is for "fails a requirement" or "stopped", never for decoration or emphasis.

---

## 4. Typography

| Role | Face | Notes |
| --- | --- | --- |
| Display (wordmark, headlines, section titles, big numbers, quotes) | **Bricolage Grotesque** (`--font-display`) | Characterful, slightly quirky grotesk. Personality without cartoon. Weights 500–750, tight tracking (−0.02 to −0.045em). |
| Text (UI, body, tables) | **Inter** (`--font-text`) | Neutral and legible at distance. Tabular numerals are on globally. |
| Mono (receipts, keys) | System mono stack | Only for identifiers, which are proof, not prose. |

Loaded with `next/font/google` in `app/layout.tsx` (self-hosted at build, no runtime CDN), with system fallbacks.

### Scale (px)

`12 · 13 · 14 · 15 (base) · 16–17 (lead) · 20–24 (section) · 26–36 (hero) · 44 (key number) · 40–68 (landing)`

- **Floor: 12px.** Nothing smaller, because the demo is viewed at presentation distance.
- Key figures (landed total, recommended price) use display at 22–44px.
- Kickers and eyebrows: 12–13px, 600–700 weight, uppercase, 0.06–0.08em tracking.

### Wordmark

`somebody.`: lowercase, Bricolage 750, with the full stop in `--somebody` orange. The dot is the brand in miniature: a small, final "handled." Don't recolour it, animate it or add a tagline next to it in the app bar.

---

## 5. Layout, space and shape

- **Single screen.** Mission Control stays one page. There are no new pages, tabs or sidebar nav.
- Container: `max-width: 1400px`, side padding `clamp(16px, 3vw, 40px)`.
- Spacing is built on 4px: 4 · 8 · 12 · 16 · 20 · 24 · 28 · 36 · 48.
- Radii: `6` (inputs, small buttons) · `10` (buttons, notices) · `16` (cards) · `24` (hero panels, delegate card) · `32%` (mascot squircle).
- Elevation: only `--shadow-card` for cards and `--shadow-float` for modal and drawer. No heavy drop shadows.
- Breakpoints: `1280` (decision grid reflows) · `1080` (single column, progress full width) · `760` (mobile stacking).
- **Target demo viewport: 1440×900.** On a 1920×1080 projector, use browser zoom of about 125% so type reads at distance. The layout is tested at 1024, 1440 and 1920 wide, and at 390 on mobile (no horizontal scroll).

### Mission Control anatomy (top to bottom)

```text
App bar      somebody. │ job title                     [who has the ball]  [+ New job]
Job header   YOU ASKED “…the vague request…”                         ●━━●━━③━━○━━○
             [25 gifts] [S$750 total] [Must arrive by Thu…] [Logo]    Brief → Done & verified
NOW PANEL    (changes with the job; see below)
Vendors      What Somebody found: 2×2 vendor cards      │ Activity
                                                         │ Everything, in order (scrolls)
Comparison   Side by side: full-width normalized table + legend
Follow-thru  Every message and record: effects with verified receipts
Footer       Development workspace note (quiet)
```

### The Now panel is the story

It sits under the job header and always answers "what's happening, and do you need to do anything?"

| Backend state | Panel | Tone | Pose |
| --- | --- | --- | --- |
| `clarifying` | "Somebody needs a couple of details" + inline brief form | decision | asking |
| `sourcing` | "Getting quotes from 4 vendors" + counts (2 quotes in · 1 missing details · 1 waiting) | somebody | typing / waiting / reviewing |
| `sourcing`, latest evidence changed a fact | "Somebody found something · *Vendor* changed their quote" + was → now | changed | reviewing |
| `sourcing` + no viable option | "Nothing on the table fits the brief" | ineligible | reviewing |
| `awaiting_approval` | **Decision panel** (below) | decision | presenting |
| `approved` / `verifying` | "Confirming *Vendor* and wrapping up" + proof checklist | somebody | following-up / verifying |
| `blocked` | "Somebody stopped · Something changed after you approved" + checklist | ineligible | stopped |
| `complete` | **Done panel** (below) | verified | done |

**Decision panel.** A yellow-bordered hero with three blocks:
1. **The pick:** channel, product, landed total (44px), order quantity, arrival, logo, budget.
2. **Why Somebody recommends this** (backend rationale) and **Why not the others**: one line per alternative with its tone dot and plain reason. Add "changed after their first reply" when that applies.
3. **The decision:** a green **Approve** button, a quiet **Not this one** button, and the consequence stated plainly: "After you approve, Somebody confirms *Vendor*, lets the other vendors know, and raises the purchase order. No payment is made." If the recommendation is stale, Approve is disabled and a violet note explains why.

**Done panel.** A green-bordered hero with a rotated **DONE AND VERIFIED** stamp (the only playful flourish), a one-sentence outcome ("Paper & Pine is confirmed for 25 gifts at $625.00.") and the proof checklist with a receipt per line. Checklist lines use to-do wording until verified ("Raise the purchase order and read it back") and past tense after ("Purchase order raised and read back from accounting").

---

## 6. Components

All live in `app/MissionControl.tsx` unless noted. Use the existing pieces before inventing new ones.

| Component | Rules |
| --- | --- |
| **Live pill** (app bar) | Answers "who has the ball?" Orange: *Somebody is on it / working*. Yellow: *Waiting on you*. Green: *Done and verified*. Red: *Stopped for review* / *Needs a rethink*. Pulses only while a run is live. |
| **Brief facts** | Chips with an icon, label and value. Unknown chips are dashed with italic "Not confirmed". Values are human: "25 gifts", "S$750.00 total", "Logo required". |
| **Progress** | Five stages: Brief → Quotes → Your decision → Follow-through → Done & verified. Done steps are an ink fill with a check; the current step is orange (yellow when it's the human's turn); a stopped step is red with a hand icon; the final done step is green. Stages come from `jobStages()`. |
| **Vendor card** | Header shows the channel chip and status pill. Then name, product, latest message with source and time, the changed strip (if any), a status note in tone ink, and a footer with contact state and landed total. Waiting vendors show animated typing dots; unknown cards are dashed. A new reply briefly flashes orange (Somebody noticed it). Expandable history strikes through replaced messages. |
| **Comparison table** | Columns: Unit · Setup · Delivery · Tax · Min. order · Arrives · Logo · Order qty · Landed · Verdict. Unknown cells show a `?` chip. The cell a failing reason points at gets a red wash (cosmetic mapping in `reasonFields()`). Changed cells get a violet underline and a "Was …" tooltip. Row bars carry the tone. A legend is always visible, and the formula note states how landed cost is computed. |
| **Proof checklist** | Groups effects into confirmation, close-outs, purchase order and outreach. Each line shows its weakest status, so it only turns verified when every effect in the group is verified. Receipt suffix shown in mono. |
| **Follow-through list** | Every effect, grouped into "After your approval" (lock icon) and "Outreach". Keep receipts visible. It's reliability evidence, not clutter. |
| **Activity log** | Newest first. Labels and tones: Somebody (orange) · New info (blue) · Your decision (yellow) · Action (green) · Update (grey). Text passes through `humanize()`. |
| **Buttons** | `primary` (ink) for forward actions, `approve` (verified green) **only** for granting authority, and `quiet` for secondary actions. One primary per region. `large` (50px) for hero actions. |
| **Pill** | `.pill.tone-*`: dot plus label. Verified and decision pills are solid fills; unknown is hollow. |
| **Notice** | Inline confirmation or error under the job header. Errors use the ineligible tone and stay calm. |

---

## 7. Mascot

A separate asset pack is producing the final character: a compact rounded creature with a simple silhouette, half-lidded, mildly unimpressed eyes, restrained expressions and small office props. **Don't invent or ship a competing character design in code.** Until the pack lands, every mascot position renders a neutral placeholder: an orange-tinted squircle with the pose's office prop icon.

### Slot API

```tsx
<Mascot pose="presenting" size="lg" live={false} />
```

- Sizes: `sm` 36px · `md` 64px · `lg` 104px (72px on mobile).
- `live` adds a slow 3px bob while Somebody is working. It stops under reduced motion.
- Accessible name: "Somebody, *pose description*".
- Pose is **derived** from persisted state by `headline()`. Never set it from local UI state.

### Poses

| Pose | When | Placeholder prop | Asset brief |
| --- | --- | --- | --- |
| `idle` | Landing, no job | coffee | Holding coffee, waiting to be handed something |
| `reading` | Loading / reading the brief | document | Reading paperwork |
| `asking` | Brief questions | clipboard | Clipboard held up, patient look |
| `typing` | Sending quote requests | laptop | Typing on a laptop |
| `waiting` | Waiting on vendor replies | phone | Phone in hand, waiting |
| `reviewing` | Comparing quotes, a change found, nothing fits | magnifier | Reviewing quotes, one eyebrow slightly lower |
| `presenting` | Needs your approval | pen | Holding out a form and pen to sign |
| `following-up` | Post-approval messages going out | mail | Sending messages |
| `verifying` | Reading results back | clipboard ✓ | Ticking a checklist |
| `done` | Done and verified | stamp | Stamp down, quiet satisfaction, maybe coffee |
| `stopped` | Blocked / error | hand | Palm up "hold on", calm, not alarmed |

### Swapping in final assets

1. Export each pose as a **square, transparent** PNG (at least 416×416, displayed up to 104px at 4×) or SVG. Keep the character centred with about 8% padding so it sits inside the squircle.
2. Put the files in `public/mascot/<pose>.png`.
3. Register them in `MASCOT_ASSETS` in `app/somebody/Mascot.tsx`:
   ```ts
   export const MASCOT_ASSETS = { typing: "/mascot/typing.png", done: "/mascot/done.png" };
   ```
   Unregistered poses keep the placeholder, so art can land one pose at a time. No layout changes are needed.
4. If the art has its own background, the `.has-art` class is available to remove the placeholder wash.

### Mascot rules

- **At most one mascot per view region**, always beside the headline it illustrates. Never put it inside data (cards, tables, checklists).
- The mascot never covers, replaces or decorates data.
- No speech bubbles, no mascot dialogue, no sarcasm. The copy is Somebody's voice; the mascot is posture.
- Don't animate faces or loop gags. The `live` bob is the only idle motion.

---

## 8. Motion

Use motion only where it helps someone understand what changed.

| Motion | Where | Duration | Meaning |
| --- | --- | --- | --- |
| Pulse ring | Live dot | 1.6s loop | Somebody is actively working |
| Bob (3px) | Mascot while live | 2.4s loop | Same |
| Typing dots | Vendor waiting | 1.2s loop | Waiting on a person |
| Orange wash fade | Vendor latest message on arrival | 1.2s once | Somebody noticed new info |
| Violet ring fade | Changed strip on arrival | 1.2s once | Reality changed |
| Stamp in | Done panel | 0.5s once | The job is finished |
| Hover/press | Buttons | 150ms | Affordance |

Everything collapses under `prefers-reduced-motion`. No page transitions, parallax, confetti or skeleton shimmer beyond the loading line.

---

## 9. Iconography

- One stroke set in `app/somebody/Icon.tsx`: 24px grid, 1.75 stroke, round caps and joins, `currentColor`.
- **Channels use generic glyphs**, not brand logos: Web = globe, Gmail = envelope, WhatsApp = chat bubble, Instagram = rounded camera, accounting = ledger. Always show the channel **name** next to the glyph.
- Add new icons to the same file in the same style. Don't add an icon library.

---

## 10. Truth rules (non-negotiable)

These keep the design honest to the architecture (`ARCHITECTURE.md`, `AGENTS.md`).

1. **The UI renders persisted state. It never decides it.** Eligibility, ranking, recommendation, approval, effects and completion come from Convex via `api.missions.view`. `presentation.ts` only maps that state to words, tones and poses. If a design needs a fact the backend doesn't persist, add it to the backend. Don't compute it in the UI.
2. **Presentation mappings are pure and tested.** Add new states or copy to `presentation.ts` with a case in `tests/presentation.test.ts` driven by the real domain.
3. **Don't hide reliability evidence to look cleaner.** Unknown `?` cells, changed facts, message history, receipts and the "sent is not the same as done" list stay visible, but can be visually quiet.
4. **Don't fake progress.** No timers, optimistic "done" states or animated steps that aren't backed by persisted state. Live motion appears only when `run.status === "running"`.
5. **Approval is explicit.** The Approve control sends the recommendation version and is disabled when the recommendation is stale. Consequences are stated beside it, and "No payment is made" stays.
6. **Be honest about the environment.** While vendors and accounting are fixtures, the quiet footer says so. Remove it when real adapters land, not before.

---

## 11. Operator layer

Demo and Development controls must never read as Somebody features.

- They live in `OperatorDrawer.tsx`, opened by a faint "Demo controls" chip (bottom-left, 45% opacity) or the <kbd>`</kbd> key. <kbd>Esc</kbd> closes it.
- The drawer holds the environment and deployment, live AI status, job key, workflow/evidence version, run summary, **Resume Somebody**, and all fixture controls.
- Environment names, deployment IDs, model names, job keys and raw workflow states appear **only** here.
- `?job=<key>` pins a specific persisted job, which is useful for rehearsing states. Creating a new job while pinned re-pins to the new job.

---

## 12. Accessibility

- Text contrast is AA or better on its ground. Meta text (`--ink-3`) is limited to 12px or larger and non-essential copy.
- State is never shown by colour alone: every tone pairs with a label, and unknown uses shape (dashed or `?`).
- The Now panel is `aria-live="polite"`. The mascot has `role="img"` with a descriptive label.
- Every interactive element is keyboard-reachable, with a visible orange-tinted focus ring. Modal and drawer close on <kbd>Esc</kbd> or backdrop click.

---

## 13. Extending the design

When a future lane adds UI (Google Workspace, Unipile, QuickBooks, web evidence, chat/voice delegation):

- **Real channels:** reuse the channel chip and vendor card. Show provider identity (message time, thread link) in the card's quote meta. Don't add per-provider layouts.
- **Sheets projection:** a quiet "Open comparison in Sheets" link in the comparison section header. Don't embed the sheet.
- **QuickBooks:** the purchase order checklist line and effect row gain the PO number and a "read back" detail. Keep the ledger icon and verified semantics.
- **Chat/voice delegation:** it replaces the landing textarea and the "New job" modal only. The job still becomes the same persisted brief; don't build a chat transcript as the main view.
- **Calendar/Drive context:** show as brief facts ("From calendar: Thu 17 Sep, Venue …"), not new panels.

### Pre-merge checklist for UI changes

- [ ] Uses tokens and `.tone-*`. No new hard-coded colours.
- [ ] Copy follows §2. No architecture terms in product UI.
- [ ] The eight comprehension points (§1) are still obvious.
- [ ] No UI-side business logic. Mappings are in `presentation.ts` and tested.
- [ ] Unknown, changed and verified evidence are still visible.
- [ ] Mascot only through `<Mascot>`, one per region.
- [ ] Checked at 1440×900 and 390 wide; no horizontal page scroll.
- [ ] Reduced motion respected; 12px type floor respected.
- [ ] Dev and environment details only in the operator drawer.
