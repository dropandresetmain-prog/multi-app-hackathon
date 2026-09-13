"use client";

import { Component, type FormEvent, type ReactNode, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type {
  Command,
  Effect,
  Mission,
  MissionView,
  Quote,
  Vendor,
} from "@/lib/procurement/types";
import { CHANNEL_ICON, Icon, type IconName } from "./somebody/Icon";
import { Mascot } from "./somebody/Mascot";
import { OperatorDrawer } from "./somebody/OperatorDrawer";
import {
  changedFacts,
  contactCopy,
  effectCopy,
  eventCopy,
  formatClock,
  formatDate,
  formatMoney,
  formatQuoteValue,
  cleanError,
  headline,
  humanize,
  jobStages,
  reasonCopy,
  reasonFields,
  selectedVendorId,
  type Tone,
  vendorEvidence,
  vendorStatus,
} from "./somebody/presentation";

const DEFAULT_REQUEST =
  "Good news, the sponsor approved some budget for gifts for Thursday. Around 25 people, maybe $30 each max. Can you sort something out?";

type Send = (command: Command, label?: string) => Promise<void>;
type NoticeState = { kind: "ok" | "error"; text: string } | null;

function defaultDeadline() {
  const date = new Date(Date.now() + 3 * 86_400_000);
  date.setMinutes(0, 0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

class MissionErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error)
      return (
        <main className="state-page">
          <div className="state-card">
            <Mascot pose="stopped" size="md" />
            <span className="kicker">Connection interrupted</span>
            <h1>Somebody lost the thread.</h1>
            <p>
              {this.state.error.message ||
                "The workspace returned an unexpected error."}
            </p>
            <button
              className="button primary"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        </main>
      );
    return this.props.children;
  }
}

export function MissionControl() {
  return (
    <MissionErrorBoundary>
      <MissionControlContent />
    </MissionErrorBoundary>
  );
}

/** `?job=<key>` pins a specific persisted job; otherwise the latest job is shown. */
function usePinnedJob() {
  // The first client render is the loading state either way, so reading the
  // URL during initialisation cannot cause a hydration mismatch.
  const [pinned, setPinned] = useState<string | undefined>(() =>
    typeof window === "undefined"
      ? undefined
      : (new URLSearchParams(window.location.search).get("job") ?? undefined),
  );
  function pin(key: string) {
    setPinned((current) => {
      if (!current) return current;
      const url = new URL(window.location.href);
      url.searchParams.set("job", key);
      window.history.replaceState(null, "", url);
      return key;
    });
  }
  return [pinned, pin] as const;
}

function MissionControlContent() {
  const [pinned, pin] = usePinnedJob();
  const view = useQuery(api.missions.view, pinned ? { key: pinned } : {}) as
    | MissionView
    | undefined;
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<NoticeState>(null);
  async function send(command: Command, label: string = command.type) {
    if (pending) return;
    setPending(label);
    setNotice(null);
    try {
      const response = await fetch("/api/mission", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: view?.mission?.key, command }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
        result?: string;
      } | null;
      if (!response.ok)
        throw new Error(
          payload?.error ??
            payload?.message ??
            `Request failed (${response.status})`,
        );
      if (command.type === "create") pin(command.key);
      setNotice({ kind: "ok", text: payload?.result ?? "Done." });
      if (
        view?.liveAiEnabled &&
        ["create", "answer_requirements", "approve", "reject"].includes(
          command.type,
        )
      ) {
        const resumed = await fetch("/api/mission", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            key: command.type === "create" ? command.key : view.mission?.key,
            command: { type: "run_agent" },
          }),
        });
        if (!resumed.ok)
          setNotice({
            kind: "ok",
            text: "Decision saved. Resume Somebody from Demo controls to continue.",
          });
      }
    } catch (error) {
      setNotice({
        kind: "error",
        text:
          error instanceof Error ? cleanError(error.message) : "That didn't go through.",
      });
    } finally {
      setPending(null);
    }
  }
  if (view === undefined) return <LoadingState />;
  return (
    <>
      {view.mission ? (
        <Workspace
          key={view.mission.key}
          view={view as MissionView & { mission: Mission }}
          pending={pending}
          notice={notice}
          send={send}
        />
      ) : (
        <EmptyState onCreate={send} pending={pending} notice={notice} />
      )}
      <OperatorDrawer
        key={`drawer-${view.mission?.key ?? "none"}`}
        mission={view.mission}
        liveAiEnabled={view.liveAiEnabled}
        deployment={view.deployment}
        pending={pending}
        send={send}
      />
    </>
  );
}

// ── Chrome ──────────────────────────────────────────────────────────────────

function Wordmark() {
  return (
    <span className="wordmark" aria-label="Somebody">
      somebody<span className="wordmark-dot">.</span>
    </span>
  );
}

function LoadingState() {
  return (
    <main className="state-page">
      <div className="state-card" aria-live="polite">
        <Mascot pose="reading" size="md" live />
        <span className="kicker">One moment</span>
        <h1>Somebody is catching up on the job.</h1>
        <div className="loading-line">
          <span />
        </div>
      </div>
    </main>
  );
}

function EmptyState({
  onCreate,
  pending,
  notice,
}: {
  onCreate: Send;
  pending: string | null;
  notice: NoticeState;
}) {
  const [request, setRequest] = useState(DEFAULT_REQUEST);
  function submit(event: FormEvent) {
    event.preventDefault();
    void onCreate(
      { type: "create", key: crypto.randomUUID(), request },
      "create mission",
    );
  }
  return (
    <div className="landing">
      <header className="topbar">
        <Wordmark />
      </header>
      <main className="delegate">
        <div className="delegate-intro">
          <Mascot pose="idle" size="lg" />
          <p className="tagline-lead">Somebody has to do it.</p>
          <h1>Now Somebody can.</h1>
          <p className="lead">
            Hand over the messy job nobody owns. Somebody chases the people,
            keeps track of what changes across your apps, and only comes back
            when it needs your call.
          </p>
        </div>
        <form className="delegate-card" onSubmit={submit}>
          <label htmlFor="job-request">What needs handling?</label>
          <textarea
            id="job-request"
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            rows={5}
            required
          />
          <div className="delegate-foot">
            <span className="hint">
              <Icon name="lock" size={15} /> Nothing is committed without your
              approval.
            </span>
            <button
              className="button primary large"
              disabled={Boolean(pending) || !request.trim()}
            >
              {pending ? "Handing over…" : "Give Somebody the job"}
              <Icon name="arrow" />
            </button>
          </div>
          {notice && <Notice notice={notice} />}
        </form>
        <ol className="promises">
          <li>
            <Icon name="laptop" /> Takes it from here
          </li>
          <li>
            <Icon name="pen" /> Comes back for decisions
          </li>
          <li>
            <Icon name="clipboard" /> Checks it actually happened
          </li>
        </ol>
      </main>
    </div>
  );
}

// ── Workspace ───────────────────────────────────────────────────────────────

function Workspace({
  view,
  pending,
  notice,
  send,
}: {
  view: MissionView & { mission: Mission };
  pending: string | null;
  notice: NoticeState;
  send: Send;
}) {
  const { mission } = view;
  const [newJobOpen, setNewJobOpen] = useState(false);
  const now = headline(mission);
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <Wordmark />
          <span className="crumb">{mission.title}</span>
        </div>
        <div className="topbar-right">
          <LivePill mission={mission} />
          <button
            className="button quiet"
            disabled={Boolean(pending)}
            onClick={() => setNewJobOpen(true)}
          >
            <Icon name="plus" size={16} /> New job
          </button>
        </div>
      </header>
      <main className="page">
        <JobHeader mission={mission} />
        {notice && <Notice notice={notice} />}
        {mission.state === "awaiting_approval" ? (
          <DecisionPanel mission={mission} send={send} pending={pending} />
        ) : mission.state === "complete" ? (
          <DonePanel mission={mission} />
        ) : (
          <section className={`now-panel tone-${now.tone}`} aria-live="polite">
            <Mascot pose={now.pose} size="lg" live={now.live} />
            <div className="now-copy">
              <span className="eyebrow">
                {now.live && <i className="live-dot" />}
                {now.eyebrow}
              </span>
              <h2>{now.title}</h2>
              {now.detail && <p>{now.detail}</p>}
              {mission.state === "clarifying" && (
                <RequirementsForm
                  mission={mission}
                  send={send}
                  pending={pending}
                />
              )}
              {["approved", "verifying", "blocked"].includes(mission.state) && (
                <ProofChecklist mission={mission} />
              )}
            </div>
          </section>
        )}
        <div className="columns">
          <VendorsSection mission={mission} />
          <ActivityLog events={view.events} />
          <Comparison mission={mission} />
          <FollowThrough mission={mission} />
        </div>
        <footer className="page-foot">
          Development workspace · vendor replies and accounting are simulated
          fixtures
        </footer>
      </main>
      {newJobOpen && (
        <NewJobModal
          onClose={() => setNewJobOpen(false)}
          onCreate={(request) => {
            void send(
              { type: "create", key: crypto.randomUUID(), request },
              "create new mission",
            );
            setNewJobOpen(false);
          }}
        />
      )}
    </div>
  );
}

function LivePill({ mission }: { mission: Mission }) {
  // The pill answers "who has the ball?" — Somebody (orange) or you (yellow).
  const live = mission.run?.status === "running";
  const [label, tone]: [string, Tone] =
    mission.state === "complete"
      ? ["Done and verified", "verified"]
      : mission.state === "blocked"
        ? ["Stopped for review", "ineligible"]
        : mission.state === "awaiting_approval" || mission.state === "clarifying"
          ? ["Waiting on you", "decision"]
          : mission.noViableOption
            ? ["Needs a rethink", "ineligible"]
            : [live ? "Somebody is working" : "Somebody is on it", "somebody"];
  return (
    <span className={`live-pill tone-${tone}`}>
      <i className={live ? "live-dot" : "still-dot"} />
      {label}
    </span>
  );
}

function JobHeader({ mission }: { mission: Mission }) {
  const r = mission.requirements;
  const facts: { label: string; value: string | null; icon: IconName }[] = [
    {
      label: "Quantity",
      value: r.quantity == null ? null : `${r.quantity} gifts`,
      icon: "clipboard",
    },
    {
      label: "Budget",
      value: r.budgetCents == null ? null : `${formatMoney(r.budgetCents)} total`,
      icon: "ledger",
    },
    {
      label: "Must arrive by",
      value: r.deadlineAt == null ? null : formatDate(r.deadlineAt),
      icon: "clock",
    },
    {
      label: "Branding",
      value: r.branded == null ? null : r.branded ? "Logo required" : "Not needed",
      icon: "stamp",
    },
  ];
  return (
    <section className="job-header">
      <div className="job-ask">
        <span className="kicker">You asked</span>
        <blockquote>“{mission.request}”</blockquote>
        <dl className="brief-facts">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className={fact.value ? "fact" : "fact is-unknown"}
            >
              <dt>
                <Icon name={fact.icon} size={14} />
                {fact.label}
              </dt>
              <dd>{fact.value ?? "Not confirmed"}</dd>
            </div>
          ))}
        </dl>
      </div>
      <ol className="progress" aria-label="Job progress">
        {jobStages(mission).map((stage, index) => (
          <li key={stage.id} className={`step ${stage.state}`}>
            <span className="step-mark">
              {stage.state === "done" ? (
                <Icon name="check" size={14} />
              ) : stage.state === "stopped" ? (
                <Icon name="hand" size={14} />
              ) : (
                index + 1
              )}
            </span>
            <span className="step-label">{stage.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Brief questions ─────────────────────────────────────────────────────────

function RequirementsForm({
  mission,
  send,
  pending,
}: {
  mission: Mission;
  send: Send;
  pending: string | null;
}) {
  const [quantity, setQuantity] = useState(mission.requirements.quantity ?? 25);
  const [budget, setBudget] = useState(
    (mission.requirements.budgetCents ?? 75000) / 100,
  );
  const [deadline, setDeadline] = useState(
    mission.requirements.deadlineAt
      ? new Date(
          mission.requirements.deadlineAt -
            new Date().getTimezoneOffset() * 60_000,
        )
          .toISOString()
          .slice(0, 16)
      : defaultDeadline(),
  );
  const [branded, setBranded] = useState(mission.requirements.branded ?? true);
  function submit(event: FormEvent) {
    event.preventDefault();
    void send(
      {
        type: "answer_requirements",
        quantity,
        budgetCents: Math.round(budget * 100),
        deadlineAt: new Date(deadline).getTime(),
        branded,
      },
      "save requirements",
    );
  }
  return (
    <form className="brief-form" onSubmit={submit}>
      <label>
        How many
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
        />
      </label>
      <label>
        Total budget (SGD)
        <input
          type="number"
          min="0"
          step="0.01"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          required
        />
      </label>
      <label className="wide">
        Must arrive by
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={branded}
          onChange={(e) => setBranded(e.target.checked)}
        />
        Add our logo
      </label>
      <button className="button primary" disabled={Boolean(pending)}>
        {pending === "save requirements" ? "Saving…" : "That's right, go"}
        <Icon name="arrow" size={16} />
      </button>
    </form>
  );
}

// ── Vendors ─────────────────────────────────────────────────────────────────

function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`pill tone-${tone}`}>{children}</span>;
}

function SectionHead({
  kicker,
  title,
  aside,
}: {
  kicker: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <span className="kicker">{kicker}</span>
        <h2>{title}</h2>
      </div>
      {aside && <div className="section-aside">{aside}</div>}
    </div>
  );
}

function VendorsSection({ mission }: { mission: Mission }) {
  const channels = mission.vendors.map((v) => v.channel);
  return (
    <section className="section" id="vendors">
      <SectionHead
        kicker="What Somebody found"
        title={`${mission.vendors.length} vendors, ${new Set(channels).size} channels`}
        aside={
          <span className="channel-row">
            {mission.vendors.map((vendor) => (
              <span key={vendor.id} className="channel-chip" title={vendor.channel}>
                <Icon name={CHANNEL_ICON[vendor.channel]} size={15} />
                {vendor.channel}
              </span>
            ))}
          </span>
        }
      />
      <div className="vendor-grid">
        {mission.vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} mission={mission} />
        ))}
      </div>
    </section>
  );
}

function VendorCard({ vendor, mission }: { vendor: Vendor; mission: Mission }) {
  const status = vendorStatus(vendor, mission);
  const history = vendorEvidence(vendor, mission.evidence);
  const latest = history[0] ?? null;
  const changes = changedFacts(vendor, mission.evidence);
  const changedIds = new Set(
    (vendor.evaluation.supersededClaims ?? []).map((claim) => claim.evidenceId),
  );
  return (
    <article className={`vendor-card tone-${status.tone}`}>
      <header className="vendor-head">
        <span className="channel-chip">
          <Icon name={CHANNEL_ICON[vendor.channel]} size={15} />
          {vendor.channel}
        </span>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </header>
      <h3>{vendor.name}</h3>
      <p className="vendor-product">{vendor.product}</p>
      {latest ? (
        // Key on the evidence id so a new reply briefly highlights on arrival.
        <blockquote key={latest.id} className="vendor-quote">
          <span className="quote-meta">
            {vendor.channel === "Web" ? "Catalogue listing" : "Latest reply"} ·{" "}
            {formatClock(latest.observedAt)}
          </span>
          {latest.text}
        </blockquote>
      ) : (
        <div className="vendor-quote is-empty">
          {vendor.channel === "Web" || vendor.communication === "none" ? (
            "Nothing yet."
          ) : (
            <span className="typing">
              Waiting for {vendor.name} to reply
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
      )}
      {changes.length > 0 && (
        <div className="changed-strip" key={`chg-${mission.evidenceVersion}`}>
          <span className="changed-label">
            <Icon name="changed" size={14} /> Changed
          </span>
          {changes.map((fact) => (
            <span key={fact.field} className="changed-fact">
              {fact.label}: <s>{fact.was}</s> → <strong>{fact.now}</strong>
            </span>
          ))}
        </div>
      )}
      {status.note && <p className={`vendor-note tone-${status.tone}`}>{status.note}</p>}
      <footer className="vendor-foot">
        <span>{contactCopy(vendor)}</span>
        <span className="vendor-total">
          {vendor.evaluation.totalCents != null ? (
            <>
              <small>Landed</small> {formatMoney(vendor.evaluation.totalCents)}
            </>
          ) : (
            <small>No total yet</small>
          )}
        </span>
      </footer>
      {history.length > 1 && (
        <details className="history">
          <summary>
            {history.length} messages · see how this changed
          </summary>
          <ol>
            {history.map((item, index) => (
              <li
                key={item.id}
                className={changedIds.has(item.id) ? "is-superseded" : ""}
              >
                <p>{item.text}</p>
                <small>
                  {index === 0 ? "Latest" : `Earlier`} ·{" "}
                  {formatDate(item.observedAt)}
                  {changedIds.has(item.id) && " · replaced by newer info"}
                </small>
              </li>
            ))}
          </ol>
        </details>
      )}
    </article>
  );
}

// ── Comparison ──────────────────────────────────────────────────────────────

const COLUMNS: { key: keyof Quote; label: string }[] = [
  { key: "unitCents", label: "Unit" },
  { key: "setupCents", label: "Setup" },
  { key: "deliveryCents", label: "Delivery" },
  { key: "taxCents", label: "Tax" },
  { key: "moq", label: "Min. order" },
  { key: "deliveryAt", label: "Arrives" },
  { key: "branded", label: "Logo" },
];

function Comparison({ mission }: { mission: Mission }) {
  const ranked = mission.ranking.rankedVendorIds;
  return (
    <section className="section" id="comparison">
      <SectionHead
        kicker="Side by side"
        title="Like for like, unknowns stay unknown"
        aside={
          <span className="section-note">
            Landed = order qty × unit + setup + delivery + tax
          </span>
        }
      />
      <div className="table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Vendor</th>
                {COLUMNS.map((column) => (
                  <th scope="col" key={column.key}>
                    {column.label}
                  </th>
                ))}
                <th scope="col">Order qty</th>
                <th scope="col" className="num">
                  Landed
                </th>
                <th scope="col">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {mission.vendors.map((vendor) => {
                const status = vendorStatus(vendor, mission);
                const failing = reasonFields(vendor);
                const changed = new Map(
                  changedFacts(vendor, mission.evidence).map((f) => [f.field, f]),
                );
                const rank = ranked.indexOf(vendor.id);
                return (
                  <tr key={vendor.id} className={`tone-${status.tone}`}>
                    <th scope="row">
                      <span className="table-vendor">
                        <Icon name={CHANNEL_ICON[vendor.channel]} size={15} />
                        <span>
                          {vendor.name}
                          <small>{vendor.channel}</small>
                        </span>
                      </span>
                    </th>
                    {COLUMNS.map((column) => {
                      const value = vendor.evaluation.quote[column.key];
                      const change = changed.get(column.key);
                      const classes = [
                        value == null ? "is-unknown" : "",
                        failing.has(column.key) ? "is-failing" : "",
                        change ? "is-changed" : "",
                      ].join(" ");
                      return (
                        <td
                          key={column.key}
                          className={classes}
                          title={change ? `Was ${change.was}` : undefined}
                        >
                          {value == null ? (
                            <span className="unknown-chip">?</span>
                          ) : column.key === "deliveryAt" ? (
                            <DateCell value={value as number} />
                          ) : (
                            formatQuoteValue(column.key, value)
                          )}
                        </td>
                      );
                    })}
                    <td>{vendor.evaluation.orderQuantity ?? <span className="unknown-chip">?</span>}</td>
                    <td className={`num landed${failing.has("total") ? " is-failing" : ""}`}>
                      {vendor.evaluation.totalCents == null ? (
                        <span className="unknown-chip">?</span>
                      ) : (
                        formatMoney(vendor.evaluation.totalCents)
                      )}
                    </td>
                    <td>
                      <StatusPill tone={status.tone}>{status.label}</StatusPill>
                      {vendor.evaluation.status === "eligible" && rank >= 0 && (
                        <small className="verdict-note">Ranked #{rank + 1}</small>
                      )}
                      {vendor.evaluation.status === "ineligible" &&
                        vendor.evaluation.reasons[0] && (
                          <small className="verdict-note">
                            {reasonCopy(vendor.evaluation.reasons[0])}
                          </small>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-legend">
          <span>
            <span className="unknown-chip">?</span> Not confirmed yet
          </span>
          <span>
            <i className="legend-swatch changed" /> Changed by a newer reply
          </span>
          <span>
            <i className="legend-swatch failing" /> Fails a hard requirement
          </span>
        </div>
      </div>
    </section>
  );
}

function DateCell({ value }: { value: number }) {
  return (
    <span className="date-cell">
      {new Intl.DateTimeFormat("en-SG", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(value)}
      <small>{formatClock(value)}</small>
    </span>
  );
}

// ── Decision ────────────────────────────────────────────────────────────────

function DecisionPanel({
  mission,
  send,
  pending,
}: {
  mission: Mission;
  send: Send;
  pending: string | null;
}) {
  const recommendation = mission.recommendation;
  const vendor = mission.vendors.find((v) => v.id === recommendation?.vendorId);
  if (!recommendation || !vendor) return null;
  const decision = mission.approvals.find(
    (item) => item.recommendationVersion === recommendation.version,
  );
  const stale = recommendation.evidenceVersion !== mission.evidenceVersion;
  const others = mission.vendors.filter((v) => v.id !== vendor.id);
  const ranked = mission.ranking.rankedVendorIds;
  const quote = vendor.evaluation.quote;
  return (
    <section className="now-panel decision-panel tone-decision" id="approval">
      <div className="decision-head">
        <Mascot pose="presenting" size="lg" />
        <div>
          <span className="eyebrow">Needs your approval</span>
          <h2>
            Somebody recommends <mark>{vendor.name}</mark>
          </h2>
          <p>Nothing is committed until you approve.</p>
        </div>
      </div>
      <div className="decision-grid">
        <div className="pick">
          <span className="channel-chip">
            <Icon name={CHANNEL_ICON[vendor.channel]} size={15} />
            {vendor.channel}
          </span>
          <h3>{vendor.product}</h3>
          <strong className="pick-total">
            {formatMoney(recommendation.totalCents)}
          </strong>
          <span className="pick-sub">landed, all fees included</span>
          <dl>
            <div>
              <dt>Order</dt>
              <dd>{recommendation.orderQuantity} units</dd>
            </div>
            <div>
              <dt>Arrives</dt>
              <dd>{formatDate(quote.deliveryAt)}</dd>
            </div>
            <div>
              <dt>Logo</dt>
              <dd>{quote.branded == null ? "Unknown" : quote.branded ? "Included" : "No"}</dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd>{formatMoney(mission.requirements.budgetCents)}</dd>
            </div>
          </dl>
        </div>
        <div className="why">
          <h3>Why Somebody recommends this</h3>
          <p className="rationale">{recommendation.rationale}</p>
          <h3>Why not the others</h3>
          <ul className="others">
            {others.map((other) => {
              const status = vendorStatus(other, mission);
              const rank = ranked.indexOf(other.id);
              return (
                <li key={other.id}>
                  <i className={`dot tone-${status.tone}`} />
                  <span className="other-name">{other.name}</span>
                  <span className="other-reason">
                    {other.evaluation.status === "eligible"
                      ? `Also viable · ranked #${rank + 1} · ${formatMoney(other.evaluation.totalCents)}`
                      : status.note ?? status.label}
                    {changedFacts(other, mission.evidence).length > 0 && (
                      <em className="other-changed">
                        {" "}
                        · changed after their first reply
                      </em>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="decide">
          {decision ? (
            <StatusPill tone={decision.decision === "approved" ? "verified" : "ineligible"}>
              {decision.decision === "approved" ? "Approved" : "Declined"}
            </StatusPill>
          ) : (
            <>
              <button
                className="button approve large"
                disabled={Boolean(pending) || stale}
                onClick={() =>
                  void send(
                    { type: "approve", recommendationVersion: recommendation.version },
                    "approve recommendation",
                  )
                }
              >
                <Icon name="check" />
                {pending === "approve recommendation" ? "Approving…" : "Approve"}
              </button>
              <button
                className="button quiet"
                disabled={Boolean(pending)}
                onClick={() =>
                  void send(
                    { type: "reject", recommendationVersion: recommendation.version },
                    "reject recommendation",
                  )
                }
              >
                Not this one
              </button>
              {stale ? (
                <p className="stale">
                  <Icon name="alert" size={15} /> New info arrived after this
                  recommendation. Somebody needs to re-check before you decide.
                </p>
              ) : (
                <p className="decide-note">
                  After you approve, Somebody confirms {vendor.name}, lets the
                  other vendors know, and raises the purchase order. No payment
                  is made.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Follow-through & proof ──────────────────────────────────────────────────

const STATUS_ORDER: Effect["status"][] = ["pending", "attempted", "unverified", "verified"];
function weakest(effects: Effect[]): Effect | null {
  return (
    [...effects].sort(
      (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
    )[0] ?? null
  );
}

function ProofChecklist({ mission }: { mission: Mission }) {
  const winnerId = selectedVendorId(mission) ?? mission.recommendation?.vendorId;
  const winner = mission.vendors.find((v) => v.id === winnerId);
  const confirmations = mission.effects.filter((e) => e.kind === "confirmation");
  const rejections = mission.effects.filter((e) => e.kind === "rejection");
  const orders = mission.effects.filter((e) => e.kind === "purchase_order");
  const outreach = mission.effects.filter((e) => !e.gated);
  const others = `${rejections.length} other ${rejections.length === 1 ? "vendor" : "vendors"}`;
  const items = [
    {
      icon: "mail" as IconName,
      todo: `Confirm the order with ${winner?.name ?? "the vendor"}`,
      done: `Order confirmed with ${winner?.name ?? "the vendor"}`,
      effects: confirmations,
    },
    {
      icon: "chat" as IconName,
      todo: `Let ${others} know politely`,
      done: `${others} closed out politely`,
      effects: rejections,
    },
    {
      icon: "ledger" as IconName,
      todo: "Raise the purchase order and read it back",
      done: "Purchase order raised and read back from accounting",
      effects: orders,
    },
    {
      icon: "search" as IconName,
      todo: `Deliver ${outreach.length} quote requests and follow-ups`,
      done: `${outreach.length} quote requests and follow-ups delivered`,
      effects: outreach,
    },
  ].filter((item) => item.effects.length > 0);
  if (!items.length) return null;
  return (
    <ul className="proof-list">
      {items.map((item) => {
        const low = weakest(item.effects)!;
        const copy = effectCopy(low, mission);
        const receipt = item.effects.find((e) => e.receiptId)?.receiptId;
        return (
          <li key={item.done} className={`proof tone-${copy.tone}`}>
            <span className="proof-mark">
              <Icon name={low.status === "verified" ? "check" : item.icon} size={16} />
            </span>
            <span className="proof-title">
              {low.status === "verified" ? item.done : item.todo}
            </span>
            <span className="proof-state">
              <StatusPill tone={copy.tone}>{copy.label}</StatusPill>
              {low.status === "verified" && receipt && (
                <small className="mono">receipt {receipt.slice(-8)}</small>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function DonePanel({ mission }: { mission: Mission }) {
  const winner = mission.vendors.find(
    (v) => v.id === (selectedVendorId(mission) ?? mission.recommendation?.vendorId),
  );
  const lastVerified = Math.max(0, ...mission.effects.map((e) => e.verifiedAt ?? 0));
  return (
    <section className="now-panel done-panel tone-verified">
      <Mascot pose="done" size="lg" />
      <div className="now-copy">
        <span className="stamp">
          <Icon name="check" size={16} /> Done and verified
        </span>
        <h2>
          {winner
            ? `${winner.name} is confirmed for ${mission.recommendation?.orderQuantity ?? mission.requirements.quantity} gifts at ${formatMoney(mission.recommendation?.totalCents)}.`
            : "The job is done."}
        </h2>
        <p>
          {winner && `Arriving ${formatDate(winner.evaluation.quote.deliveryAt)}. `}
          Somebody read back every action to check it actually happened
          {lastVerified ? ` · last checked ${formatClock(lastVerified)}` : ""}.
        </p>
        <ProofChecklist mission={mission} />
      </div>
    </section>
  );
}

function FollowThrough({ mission }: { mission: Mission }) {
  if (!mission.effects.length) return null;
  const verified = mission.effects.filter((e) => e.status === "verified").length;
  const groups = [
    { title: "After your approval", effects: mission.effects.filter((e) => e.gated) },
    { title: "Outreach", effects: mission.effects.filter((e) => !e.gated) },
  ].filter((group) => group.effects.length);
  return (
    <section className="section" id="proof">
      <SectionHead
        kicker="Every message and record"
        title="Sent is not the same as done"
        aside={
          <span className="section-note">
            {verified} of {mission.effects.length} checked after sending
          </span>
        }
      />
      <div className="effects-card">
        {groups.map((group) => (
          <div key={group.title} className="effect-group">
            <h3>
              {group.title === "After your approval" && <Icon name="lock" size={14} />}
              {group.title}
            </h3>
            {group.effects.map((effect) => {
              const copy = effectCopy(effect, mission);
              const vendor = mission.vendors.find((v) => v.id === effect.targetId);
              return (
                <div key={effect.key} className={`effect-row tone-${copy.tone}`}>
                  <span className="effect-icon">
                    <Icon
                      name={
                        effect.kind === "purchase_order"
                          ? "ledger"
                          : vendor
                            ? CHANNEL_ICON[vendor.channel]
                            : "mail"
                      }
                      size={16}
                    />
                  </span>
                  <span className="effect-text">
                    <strong>{copy.title}</strong>
                    <span>{copy.target}</span>
                  </span>
                  <span className="effect-state">
                    <StatusPill tone={copy.tone}>{copy.label}</StatusPill>
                    {effect.receiptId ? (
                      <small className="mono" title={effect.receiptId}>
                        receipt {effect.receiptId.slice(-8)}
                      </small>
                    ) : effect.attempts > 1 ? (
                      <small>{effect.attempts} attempts · one effect</small>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Activity ────────────────────────────────────────────────────────────────

function ActivityLog({ events }: { events: MissionView["events"] }) {
  return (
    <aside className="activity">
      <SectionHead
        kicker="Activity"
        title="Everything, in order"
        aside={<span className="count">{events.length}</span>}
      />
      {events.length === 0 ? (
        <p className="muted">Nothing yet.</p>
      ) : (
        <ol className="timeline">
          {events.slice(0, 24).map((event, index) => {
            const copy = eventCopy(event.kind);
            return (
              <li key={`${event.at}-${index}`} className={`tone-${copy.tone}`}>
                <i className="timeline-dot" />
                <div>
                  <span className="timeline-meta">
                    <strong>{copy.label}</strong> · {formatClock(event.at)}
                  </span>
                  <p title={event.text}>{humanize(event.text)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}

// ── Small parts ─────────────────────────────────────────────────────────────

function NewJobModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (request: string) => void;
}) {
  const [request, setRequest] = useState(DEFAULT_REQUEST);
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-job-title"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onCreate(request);
        }}
      >
        <span className="kicker">New job</span>
        <h2 id="new-job-title">What needs handling?</h2>
        <textarea
          aria-label="Job request"
          rows={5}
          value={request}
          onChange={(event) => setRequest(event.target.value)}
          required
        />
        <div className="modal-actions">
          <button className="button quiet" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" disabled={!request.trim()}>
            Give Somebody the job <Icon name="arrow" size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

function Notice({ notice }: { notice: { kind: "ok" | "error"; text: string } }) {
  return (
    <div className={`notice ${notice.kind}`} role="status">
      <Icon name={notice.kind === "ok" ? "check" : "alert"} size={16} />
      {notice.text}
    </div>
  );
}
