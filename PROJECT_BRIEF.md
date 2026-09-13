# Project Brief

Working name: **Trust Issues** — provisional.

## The problem

Small businesses rarely have a dedicated person for every function.

When an unusual operational task appears, it usually lands on whoever has capacity:

- the founder;
- an operations person;
- an admin;
- a marketer;
- somebody whose actual job has nothing to do with the task.

The work still has to get done.

Someone becomes the temporary procurement officer, event coordinator, researcher, scheduler, vendor chaser, spreadsheet updater, or accounts administrator.

These jobs are often not intellectually difficult. They are difficult because they are:

- fragmented across many apps;
- interruption-heavy;
- dependent on other people replying;
- full of missing or inconsistent information;
- tedious to follow through;
- easy to forget halfway;
- dangerous to automate carelessly when money or external commitments are involved.

In a larger company, these tasks are distributed across specialist teams.

In a small company, somebody simply picks up the slack.

## Product idea

**Trust Issues gives small teams autonomous AI workers that can pick up this operational slack and own bounded jobs end to end.**

The goal is not another assistant that helps a human write emails or tells them what to do next.

The worker should actually do the job:

```text
understand the request
→ gather existing context
→ decide what information is missing
→ use the appropriate apps
→ contact external people when needed
→ wait for and interpret replies
→ follow up
→ reconcile changing information
→ recommend a decision
→ ask the human only when authority is required
→ execute the approved outcome
→ verify that it actually happened
```

The human should be able to delegate an annoying operational problem and come back when a meaningful decision is needed.

## Why this is not just another AI assistant

General AI assistants increasingly demonstrate that models can search the web, use software, send messages, schedule things, and take actions.

That makes tool access less interesting on its own.

The harder problem begins when an AI worker is given enough autonomy to own a real business outcome.

The system must know:

- whether it has enough information to act;
- which facts are current;
- when two pieces of evidence conflict;
- what the worker is authorized to do;
- when human approval is mandatory;
- whether an action has already been performed;
- whether an API call actually produced the intended business result;
- whether the overall job is genuinely complete.

That is where **Trust Issues** gets its name.

The worker should not blindly trust:

- its own previous conclusions;
- stale vendor information;
- a successful tool call;
- a model-generated recipient;
- or even its own statement that the task is finished.

Autonomy becomes useful when it is paired with evidence, boundaries, persistent state, and verification.

## Product thesis

The long-term product is an **AI workforce layer for small teams**.

Different workers can eventually take ownership of different operational roles:

- Procurement;
- Operations;
- Executive Assistance;
- Customer Service;
- Sales Operations;
- Finance Operations;
- other bounded business functions.

Each role has different professional judgment, but they share common reliability requirements.

The architecture therefore separates four concerns.

### Role Agent

The actual autonomous worker.

It interprets the job, reasons about what to do next, selects tools, communicates, and drives work forward.

For the hackathon, there is **one Procurement Agent**.

### Role Adapter

Encodes professional/domain judgment.

For Procurement this includes concepts such as:

- quote completeness;
- landed cost;
- quantity;
- MOQ;
- branding requirements;
- stock;
- delivery deadlines;
- vendor eligibility;
- what requires clarification;
- when the worker is ready to recommend.

### Core Worker Contract

Defines what the worker is trying to accomplish and the boundaries around it:

- objective;
- facts;
- required information;
- constraints;
- authority;
- allowed side effects;
- success conditions;
- verification requirements;
- escalation conditions;
- idempotency scope.

### Reliability Core

Owns the parts the model should not be trusted to improvise:

- workflow state;
- evidence history;
- approval gates;
- deterministic recipient identity;
- idempotency;
- side-effect tracking;
- verification;
- partial/unresolved outcomes;
- reconciliation when newer evidence supersedes older evidence.

The model may decide what it wants to do.

Application policy decides whether that action is legal.

External evidence decides whether it worked.

## Hackathon showcase: the employee who gets stuck with procurement

The hackathon demonstrates one relatable example of the broader problem.

A small company already has a modest event for roughly **20–30 guests** happening in about **three days**.

The event itself was already planned.

Then a sponsor unexpectedly approves a budget for attendee gifts.

There was no reason to procure gifts earlier because the budget did not exist.

Now someone on the team gets handed a vague instruction:

> Good news, the sponsor approved some budget for gifts for Thursday. Around 25 people, maybe $30 each max. Can you sort something out?

In a normal SME, one employee now becomes a procurement officer for the afternoon.

They need to:

```text
figure out what the request actually means
→ check event details
→ find vendors
→ compare public catalogues
→ email suppliers
→ WhatsApp suppliers
→ DM suppliers
→ wait for replies
→ chase missing information
→ normalize completely different quotes
→ work out what can actually arrive in time
→ recommend something
→ get approval
→ confirm the winner
→ reject the others
→ update the spreadsheet
→ create the accounting record
```

It is exactly the kind of work that has to happen but that nobody particularly wants to spend half a day doing.

The Procurement Agent picks up that slack.

## Demo workflow

The user gives the request by text, with speech-to-text as a preferred presentation enhancement.

The agent then owns the job.

### 1. Understand the mission

The agent reads the existing Google Calendar event and relevant Google Drive material.

It should infer information that is already available rather than asking the user to repeat it.

It asks only clarification questions that materially affect procurement.

### 2. Source through real channels

The worker investigates four deliberately different vendor paths.

**Vendor A — Web**

A real public vendor and real catalogue/product page.

No fake site and no outreach.

The system retains the real URL and public evidence.

**Vendor B — Gmail**

A real RFQ is sent through Gmail to a controlled vendor mailbox.

The vendor can reply naturally and may provide incomplete information or a quote attachment.

**Vendor C — WhatsApp**

The Procurement Agent communicates through Unipile with a controlled second WhatsApp account.

Replies can be informal and messy in the way real supplier conversations often are.

**Vendor D — Instagram**

The Procurement Agent communicates through Unipile with a controlled Instagram counterparty.

Instagram is part of the intended demo path unless it becomes a material reliability blocker.

### 3. Turn messy responses into a real procurement decision

The worker converts different sources into comparable evidence such as:

- quantity;
- unit price;
- setup/customization cost;
- delivery cost;
- tax;
- total landed cost;
- MOQ;
- branding/customization;
- availability;
- production lead time;
- confirmed delivery;
- packaging where relevant.

A vendor is not treated as comparable simply because a price exists.

Missing information triggers a follow-up rather than a guess.

### 4. Handle changing reality

At least one supplier should provide information that later changes.

For example:

```text
Vendor:
"Wednesday delivery should be fine."

later:

"Sorry — customized units can only arrive Friday."
```

The worker must not keep reasoning from the stale Wednesday claim.

The newer authoritative evidence supersedes it, the evidence history remains visible, and vendor eligibility changes.

This demonstrates a core product behavior:

**the worker continuously reconciles reality instead of treating its first understanding as permanent truth.**

### 5. Recommend, but do not overstep

Once enough information is available, the worker recommends an option.

The cheapest supplier does not automatically win.

The recommendation should respect hard constraints such as:

- deadline;
- quantity;
- customization;
- budget;
- availability.

The worker may autonomously research, contact, clarify, normalize and recommend.

It may **not** commit company money or finalize the vendor decision without human approval.

### 6. Human approval

Mission Control presents the recommendation and the evidence behind it.

The human approves, rejects, or requests further negotiation/clarification.

Approval is persisted application state, not merely a conversational statement the model interprets.

### 7. Finish the job

After approval, the worker can:

- confirm the winning vendor;
- close out the other vendor conversations;
- update the Google Sheet comparison;
- create the QuickBooks Sandbox Purchase Order.

The Purchase Order is then independently read back.

Only after the expected external state is verified can that accounting action be considered complete.

## The reliability showcase

The demo should make a few reliability behaviors visible rather than explaining them abstractly.

### Information sufficiency

```text
Price known
Delivery unknown

→ NOT READY TO COMPARE
→ agent asks vendor
```

### Hard constraints beat headline price

```text
Vendor A is cheapest
but delivery misses the event

→ INELIGIBLE
```

### Evidence can become stale

```text
Wednesday delivery
→ later corrected to Friday

→ Wednesday evidence remains in history but is superseded
→ eligibility changes
```

### Authority is enforced

```text
Agent recommends Vendor C
but approval does not exist

→ award action blocked
→ QuickBooks PO blocked
```

### Side effects are idempotent

Retrying an action must not create:

- duplicate RFQs;
- duplicate confirmations;
- duplicate rejection messages;
- duplicate Purchase Orders.

### Tool success is not outcome success

```text
QuickBooks create PO returned success

≠ job complete

read PO back
→ compare expected state
→ VERIFIED
→ then complete
```

## Actual agent runtime

This project contains a real autonomous agent, not a scripted workflow pretending to be one.

Use the **OpenAI Agents SDK for TypeScript** to implement one Procurement Agent.

The agent owns reasoning such as:

- what information is missing;
- which tool it should use;
- which vendor needs clarification;
- when enough information exists to produce a recommendation;
- what action should happen next.

Its tool surface will progressively expose capabilities such as:

```text
read_calendar
read_drive
search_web
send_email
send_whatsapp
send_instagram
inspect_vendor_state
record_vendor_evidence
request_approval
confirm_vendor
update_sheet
create_purchase_order
verify_purchase_order
```

The exact tool design should stay small and implementation-driven.

### Model strategy

Preferred runtime:

```text
OpenAI Agents SDK
→ OpenRouter
→ free model that passes reliability/tool-use tests
```

Fallback:

```text
OpenAI Agents SDK
→ direct OpenAI model
```

The application should not require a rewrite when the model provider changes.

`LIVE_AI_ENABLED=true|false` gates intentional model usage during development.

There is no separate `DEMO_MODE`.

## Persistent state

**Convex is the operational source of truth.**

The agent should not depend on in-memory conversation state to remember the job.

Convex persists the mission, vendor state, evidence, approvals, effects, verification and structured activity.

Current Development deployment:

`acrobatic-swan-765`

Preview and Production are not currently created.

Exact environment rules live in `docs/ENVIRONMENTS.md`.

## Human-facing surfaces

### Mission Control

The primary product surface is a live workspace showing the employee what their AI worker is doing.

It should answer, at a glance:

- What job did I delegate?
- What is the worker doing now?
- Who has it contacted?
- What has each vendor said?
- What information is still missing?
- Which options remain viable?
- Why is it recommending this one?
- What needs my approval?
- Did the final actions actually happen?

This should feel like observing a competent colleague working—not watching raw model logs or chain-of-thought.

### Google Sheets

The system also projects the normalized vendor comparison into Google Sheets.

This is intentional.

Many SME users already understand and trust spreadsheets.

Sheets is therefore a useful human artifact while Convex remains the machine source of truth.

## Real integrations

The current integration plan is intentionally practical.

Already preflighted:

- Google Workspace: Gmail, Calendar, Drive, Sheets;
- Unipile: WhatsApp and Instagram;
- QuickBooks Online Sandbox;
- Convex Development.

Available:

- OpenRouter;
- direct OpenAI fallback;
- Exa for explicit search/evidence retrieval when useful;
- Vercel for deployment.

The demo should simulate vendor **people** where necessary through controlled accounts, but not simulate the integrations themselves.

## What this project is not

This hackathon project is not:

- another generic chat assistant;
- a procurement SaaS platform;
- an AI org-chart simulator;
- a dynamic multi-agent company;
- a CRM;
- a payment system;
- a general browser-automation product.

It is one autonomous worker completing one messy real-world business job across multiple real systems.

The generality comes from the boundaries underneath it, not from building five different workers during a hackathon.

## Hackathon success

A successful demo should make the audience think:

> "I have tasks like this at work that nobody really owns. I would give those to this."

The technical story underneath should then show why that delegation can be trusted:

- real autonomous reasoning;
- real multi-app actions;
- persistent state;
- changing external evidence;
- bounded authority;
- retry safety;
- verification before completion.

The demo should be understandable as a useful product even if the audience never hears the words "Reliability Core" or "Core Worker Contract."

Those concepts exist to make the product work.

They are not the product pitch.

## Current scope

Critical path:

```text
one SME operational problem
→ one Procurement Agent
→ one persistent workflow
→ four sourcing channels
→ messy asynchronous vendor responses
→ one normalized recommendation
→ one human approval
→ real vendor follow-through
→ one verified accounting action
```

Everything else is secondary to making that experience work reliably and look convincing.
