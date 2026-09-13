"use client";

import {
  Component,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type {
  Command,
  Effect,
  Evidence,
  Mission,
  MissionView,
  Quote,
  Vendor,
} from "@/lib/procurement/types";
import {
  buildConversation,
  conversationStatusLabel,
  type ConversationMessage,
} from "./conversation";
import { speakText, stopSpeaking, useSpeechToText } from "./useSpeechToText";

const DEFAULT_REQUEST =
  "Sponsor finally approved $500 for gifts for Thursday. About 25 people. Can you sort out something useful and branded? Maybe tumblers?";
const money = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
  maximumFractionDigits: 2,
});

function formatMoney(cents: number | null | undefined) {
  return cents == null ? "—" : money.format(cents / 100);
}
function formatTime(value: number | null | undefined, withDate = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-SG", {
    day: withDate ? "numeric" : undefined,
    month: withDate ? "short" : undefined,
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}
function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function defaultDeadline() {
  const date = new Date(Date.now() + 3 * 86_400_000);
  date.setMinutes(0, 0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

type IconName =
  | "spark"
  | "brief"
  | "vendors"
  | "compare"
  | "approval"
  | "proof"
  | "clock"
  | "arrow"
  | "mic"
  | "stop"
  | "speaker"
  | "send";
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    spark: (
      <path d="M12 2l1.45 4.55L18 8l-4.55 1.45L12 14l-1.45-4.55L6 8l4.55-1.45L12 2Zm-7 9 .9 2.1L8 14l-2.1.9L5 17l-.9-2.1L2 14l2.1-.9L5 11Zm13 5 .75 1.75L20.5 18l-1.75.75L18 20.5l-.75-1.75L15.5 18l1.75-.75L18 16Z" />
    ),
    brief: (
      <>
        <path d="M4 7h16v12H4z" />
        <path d="M9 7V5h6v2M4 11h16M10 11v2h4v-2" />
      </>
    ),
    vendors: (
      <>
        <circle cx="8" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M2.5 19c.6-4 2.6-6 5.5-6s4.9 2 5.5 6M14 14c3.8-.5 6.1 1.2 7 5" />
      </>
    ),
    compare: (
      <>
        <path d="M4 5h16M4 12h16M4 19h16" />
        <path d="M8 3v4M15 10v4M11 17v4" />
      </>
    ),
    approval: (
      <>
        <path d="m5 12 4 4L19 6" />
        <circle cx="12" cy="12" r="10" />
      </>
    ),
    proof: (
      <>
        <path d="M7 3h10l3 3v15H4V3h3Z" />
        <path d="M8 3v5h8V3M8 13h8M8 17h5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    mic: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </>
    ),
    stop: <rect x="7" y="7" width="10" height="10" rx="1.5" />,
    speaker: (
      <>
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        <path d="M16 9a4 4 0 0 1 0 6M18.5 7a7 7 0 0 1 0 10" />
      </>
    ),
    send: <path d="M4 12h14m-5-5 5 5-5 5" />,
  };
  return (
    <svg
      aria-hidden="true"
      className="icon"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}
function communicationLabel(state: Vendor["communication"]) {
  return {
    none: "No outbound intent",
    pending: "Intent pending",
    attempted: "Send attempted",
    unverified: "Provider success, unverified",
    verified: "Verified contact",
  }[state];
}
function channelMark(channel: Vendor["channel"]) {
  return { Web: "◎", Gmail: "M", WhatsApp: "W", Instagram: "I" }[channel];
}
function newestEvidence(vendor: Vendor, evidence: Evidence[]) {
  const ids = new Set(vendor.evaluation.currentEvidenceIds);
  return (
    evidence
      .filter((item) => item.vendorId === vendor.id && ids.has(item.id))
      .sort((a, b) => b.observedAt - a.observedAt)[0] ?? null
  );
}
function requirementValue(
  mission: Mission,
  key: keyof Mission["requirements"],
) {
  const value = mission.requirements[key];
  if (key === "budgetCents") return formatMoney(value as number | null);
  if (key === "deadlineAt")
    return value ? formatTime(value as number, true) : "Not confirmed";
  if (key === "branded")
    return value == null
      ? "Not confirmed"
      : value
        ? "Required"
        : "Not required";
  return value == null ? "Not confirmed" : String(value);
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
          <div className="state-card error-card">
            <span className="eyebrow">Connection interrupted</span>
            <h1>Somebody could not load.</h1>
            <p>
              {this.state.error.message ||
                "Convex returned an unexpected error."}
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

function MissionControlContent() {
  const view = useQuery(api.missions.view, {}) as MissionView | undefined;
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);
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
      setNotice({
        kind: "ok",
        text: payload?.result ?? `${titleCase(command.type)} accepted.`,
      });
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
            text: "Decision saved. Somebody will continue from persisted state when the agent is available.",
          });
      }
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "The command failed.",
      });
    } finally {
      setPending(null);
    }
  }
  if (view === undefined) return <LoadingState />;
  if (!view.mission)
    return (
      <EmptyState
        onCreate={send}
        pending={pending}
        notice={notice}
        deployment={view.deployment}
      />
    );
  return (
    <Workspace
      key={view.mission.key}
      view={view as MissionView & { mission: Mission }}
      pending={pending}
      notice={notice}
      send={send}
    />
  );
}

function LoadingState() {
  return (
    <main className="state-page">
      <div className="state-card loading-card" aria-live="polite">
        <div className="brand-seal">
          <Icon name="spark" size={22} />
        </div>
        <span className="eyebrow">Somebody</span>
        <h1>Connecting…</h1>
        <p>Reading the latest mission state from Convex Development.</p>
        <div className="loading-line">
          <span />
        </div>
      </div>
    </main>
  );
}

function RequestComposer({
  value,
  onChange,
  onSubmit,
  pending,
  submitLabel,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  pending: string | null;
  submitLabel: string;
  disabled?: boolean;
}) {
  const speech = useSpeechToText({
    onFinal: (transcript) => {
      onChange(value.trim() ? `${value.trim()} ${transcript}` : transcript);
    },
  });
  useEffect(() => () => stopSpeaking(), []);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!value.trim() || disabled || pending) return;
    onSubmit();
  }
  return (
    <form className="composer" onSubmit={submit}>
      <label className="sr-only" htmlFor="somebody-request">
        What needs handling?
      </label>
      <textarea
        id="somebody-request"
        value={
          speech.listening && speech.interim
            ? `${value}${value ? " " : ""}${speech.interim}`
            : value
        }
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder="Describe the work Somebody should take on…"
        required
        disabled={Boolean(disabled) || Boolean(pending)}
      />
      <div className="composer-footer">
        <div className="composer-tools">
          {speech.supported ? (
            <button
              type="button"
              className={`button tertiary mic-button ${speech.listening ? "listening" : ""}`}
              disabled={Boolean(pending)}
              onClick={() => speech.toggle()}
              aria-pressed={speech.listening}
              aria-label={
                speech.listening
                  ? "Stop voice input"
                  : "Dictate request with microphone"
              }
              title={
                speech.listening ? "Stop listening" : "Dictate with microphone"
              }
            >
              <Icon name={speech.listening ? "stop" : "mic"} size={16} />
              {speech.listening ? "Listening…" : "Voice"}
            </button>
          ) : (
            <span className="composer-hint">
              Voice input needs Chrome or Edge
            </span>
          )}
          {speech.error && <span className="composer-error">{speech.error}</span>}
        </div>
        <button
          className="button primary"
          disabled={Boolean(pending) || Boolean(disabled) || !value.trim()}
        >
          {pending ? "Sending…" : submitLabel}
          <Icon name="send" size={16} />
        </button>
      </div>
    </form>
  );
}

function EmptyState({
  onCreate,
  pending,
  notice,
  deployment,
}: {
  onCreate: (command: Command, label?: string) => Promise<void>;
  pending: string | null;
  notice: { kind: "ok" | "error"; text: string } | null;
  deployment: string;
}) {
  const [request, setRequest] = useState(DEFAULT_REQUEST);
  return (
    <main className="empty-page somebody-home">
      <header className="empty-header">
        <div className="wordmark">
          <span className="brand-seal">
            <Icon name="spark" />
          </span>
          <div className="wordmark-copy">
            <span>Somebody</span>
            <small>For work that nobody has to do.</small>
          </div>
        </div>
        <span className="environment-pill">
          <i /> Development · {deployment}
        </span>
      </header>
      <section className="delegate-card chat-start">
        <div className="delegate-copy">
          <span className="eyebrow">Delegate</span>
          <h1>Somebody’s gotta do it. Now Somebody can.</h1>
          <p>
            Describe the messy job in plain language. Somebody works from
            persisted mission state — not a throwaway chat transcript.
          </p>
        </div>
        <RequestComposer
          value={request}
          onChange={setRequest}
          pending={pending}
          submitLabel="Hand it to Somebody"
          onSubmit={() =>
            void onCreate(
              { type: "create", key: crypto.randomUUID(), request },
              "create mission",
            )
          }
        />
        {notice && <Notice notice={notice} />}
      </section>
    </main>
  );
}

function Workspace({
  view,
  pending,
  notice,
  send,
}: {
  view: MissionView & { mission: Mission };
  pending: string | null;
  notice: { kind: "ok" | "error"; text: string } | null;
  send: (command: Command, label?: string) => Promise<void>;
}) {
  const { mission } = view;
  const [newMissionOpen, setNewMissionOpen] = useState(false);
  const [newRequest, setNewRequest] = useState(DEFAULT_REQUEST);
  const messages = useMemo(() => buildConversation(view), [view]);
  const currentStep = ["clarifying", "sourcing"].includes(mission.state)
    ? 1
    : mission.state === "awaiting_approval"
      ? 2
      : mission.state === "approved" || mission.state === "verifying"
        ? 3
        : mission.state === "complete"
          ? 5
          : 1;
  const needsRequirements = Object.values(mission.requirements).some(
    (value) => value == null,
  );
  return (
    <div className="app-shell somebody-shell">
      <header className="topbar">
        <div className="wordmark">
          <span className="brand-seal">
            <Icon name="spark" />
          </span>
          <div className="wordmark-copy">
            <span>Somebody</span>
            <small>For work that nobody has to do.</small>
          </div>
        </div>
        <div className="topbar-right">
          <button
            className="button tertiary new-mission-button"
            disabled={Boolean(pending)}
            onClick={() => setNewMissionOpen(true)}
          >
            + New request
          </button>
          <span className={`ai-pill ${view.liveAiEnabled ? "on" : "off"}`}>
            <i /> {view.liveAiEnabled ? "Live AI enabled" : "Fixture worker"}
          </span>
          <span className="environment-pill">
            <i /> Development · {view.deployment}
          </span>
        </div>
      </header>
      <div className="somebody-layout">
        <section className="conversation-panel" aria-label="Conversation">
          <div className="conversation-header">
            <div>
              <span className="eyebrow">Conversation</span>
              <h1>{mission.title}</h1>
              <p className="conversation-status">
                <span className={`state-dot ${mission.state}`} />
                {conversationStatusLabel(mission)} · Updated{" "}
                {formatTime(mission.updatedAt)}
              </p>
            </div>
            <StateStepper step={currentStep} />
          </div>
          {notice && <Notice notice={notice} />}
          <ConversationThread
            messages={messages}
            mission={mission}
            needsRequirements={needsRequirements}
            pending={pending}
            send={send}
          />
          <div className="conversation-composer-slot">
            {mission.state === "clarifying" && needsRequirements ? (
              <p className="composer-locked">
                Answer Somebody’s clarification in the thread above to resume.
              </p>
            ) : mission.state === "awaiting_approval" &&
              mission.recommendation &&
              !mission.approvals.some(
                (item) =>
                  item.recommendationVersion === mission.recommendation?.version,
              ) ? (
              <p className="composer-locked">
                Approve or reject the recommendation in the thread to continue.
              </p>
            ) : mission.state === "complete" ? (
              <p className="composer-locked">
                This mission is complete. Start a new request when you need
                Somebody again.
              </p>
            ) : (
              <div className="working-strip">
                <div className="agent-orb">
                  <Icon name="spark" size={18} />
                </div>
                <div>
                  <strong>{mission.activity}</strong>
                  {mission.run && (
                    <span>
                      {mission.run.summary} · {mission.run.toolCalls} tool{" "}
                      {mission.run.toolCalls === 1 ? "call" : "calls"}
                    </span>
                  )}
                </div>
                <span
                  className={
                    mission.run?.status === "running" ? "pulse" : "still"
                  }
                />
              </div>
            )}
          </div>
        </section>
        <aside className="ops-panel" aria-label="Mission Control">
          <div className="ops-panel-header">
            <span className="eyebrow">Mission Control</span>
            <h2>Operational truth</h2>
            <p>
              Persisted Convex state. Somebody does not invent numbers in the
              browser.
            </p>
          </div>
          <BriefCard mission={mission} compact />
          <VendorsSection mission={mission} />
          <Comparison mission={mission} />
          <ApprovalCard
            mission={mission}
            send={send}
            pending={pending}
            compact
          />
          <Effects mission={mission} />
          <ActivityTrail events={view.events} />
          <DevelopmentControls
            mission={mission}
            liveAiEnabled={view.liveAiEnabled}
            send={send}
            pending={pending}
          />
        </aside>
      </div>
      {newMissionOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setNewMissionOpen(false)}
        >
          <div
            className="new-mission-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-mission-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="eyebrow">New request</span>
            <h2 id="new-mission-title">Hand another job to Somebody</h2>
            <RequestComposer
              value={newRequest}
              onChange={setNewRequest}
              pending={pending}
              submitLabel="Create mission"
              onSubmit={() => {
                void send(
                  {
                    type: "create",
                    key: crypto.randomUUID(),
                    request: newRequest,
                  },
                  "create new mission",
                );
                setNewMissionOpen(false);
              }}
            />
            <div className="modal-actions">
              <button
                className="button secondary"
                type="button"
                onClick={() => setNewMissionOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConversationThread({
  messages,
  mission,
  needsRequirements,
  pending,
  send,
}: {
  messages: ConversationMessage[];
  mission: Mission;
  needsRequirements: boolean;
  pending: string | null;
  send: (command: Command, label?: string) => Promise<void>;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, mission.state, mission.question, mission.recommendation?.version]);
  const showRequirements =
    mission.state === "clarifying" &&
    (Boolean(mission.question) || needsRequirements);
  const recommendation = mission.recommendation;
  const decision = recommendation
    ? mission.approvals.find(
        (item) => item.recommendationVersion === recommendation.version,
      )
    : null;
  return (
    <div className="conversation-thread" role="log" aria-live="polite">
      {messages.map((message) => (
        <article
          key={message.id}
          className={`chat-bubble ${message.role}`}
          data-source={message.source}
        >
          <header>
            <strong>
              {message.role === "user"
                ? "You"
                : message.role === "somebody"
                  ? "Somebody"
                  : "System"}
            </strong>
            <time dateTime={new Date(message.at).toISOString()}>
              {formatTime(message.at)}
            </time>
            {message.role === "somebody" && (
              <button
                type="button"
                className="tts-button"
                title="Read aloud"
                onClick={() => speakText(message.text)}
              >
                <Icon name="speaker" size={14} />
              </button>
            )}
          </header>
          <p>{message.text}</p>
        </article>
      ))}
      {showRequirements && (
        <div className="chat-interactive">
          <RequirementsForm mission={mission} send={send} pending={pending} />
        </div>
      )}
      {recommendation && !decision && (
        <div className="chat-interactive">
          <InlineApproval
            mission={mission}
            send={send}
            pending={pending}
          />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function InlineApproval({
  mission,
  send,
  pending,
}: {
  mission: Mission;
  send: (command: Command, label?: string) => Promise<void>;
  pending: string | null;
}) {
  const recommendation = mission.recommendation;
  if (!recommendation) return null;
  const vendor = mission.vendors.find(
    (candidate) => candidate.id === recommendation.vendorId,
  );
  const stale =
    recommendation.evidenceVersion !== mission.evidenceVersion;
  return (
    <div className="inline-approval">
      <span className="question-label">Your decision is required</span>
      <h3>
        {vendor
          ? `Approve ${vendor.name} for ${formatMoney(recommendation.totalCents)}?`
          : "Approve this recommendation?"}
      </h3>
      <p>{recommendation.rationale}</p>
      {stale && (
        <div className="stale-warning">
          New evidence arrived after this recommendation. Review before
          approving.
        </div>
      )}
      <div className="approval-actions">
        <button
          className="button primary"
          disabled={Boolean(pending) || stale}
          onClick={() =>
            void send(
              {
                type: "approve",
                recommendationVersion: recommendation.version,
              },
              "approve recommendation",
            )
          }
        >
          <Icon name="approval" /> Approve
        </button>
        <button
          className="button secondary"
          disabled={Boolean(pending)}
          onClick={() =>
            void send(
              {
                type: "reject",
                recommendationVersion: recommendation.version,
              },
              "reject recommendation",
            )
          }
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function ActivityTrail({
  events,
}: {
  events: MissionView["events"];
}) {
  return (
    <section className="panel activity-mini">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">Audit trail</span>
          <h2>What changed</h2>
        </div>
        <span className="event-count">{events.length}</span>
      </div>
      <div className="timeline">
        {events.length === 0 ? (
          <p className="muted">No activity recorded yet.</p>
        ) : (
          events.slice(0, 12).map((event, index) => (
            <div
              className={`timeline-item ${event.kind}`}
              key={`${event.at}-${index}`}
            >
              <span className="timeline-pin" />
              <div>
                <span>
                  {titleCase(event.kind)} · {formatTime(event.at)}
                </span>
                <p>{event.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function StateStepper({ step }: { step: number }) {
  const stages = ["Source", "Recommend", "Approve", "Verify"];
  return (
    <ol className="stepper" aria-label="Mission progress">
      {stages.map((stage, index) => (
        <li
          className={
            index + 1 < step ? "done" : index + 1 === step ? "current" : ""
          }
          key={stage}
        >
          <span>{index + 1 < step ? "✓" : index + 1}</span>
          {stage}
        </li>
      ))}
    </ol>
  );
}

function BriefCard({
  mission,
  compact = false,
}: {
  mission: Mission;
  compact?: boolean;
}) {
  const needsRequirements = Object.values(mission.requirements).some(
    (value) => value == null,
  );
  return (
    <section className="panel brief-panel" id="brief">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{compact ? "Brief" : "01 · Structured brief"}</span>
          <h2>{compact ? "Requirements" : "The job as understood"}</h2>
        </div>
        <span
          className={
            needsRequirements ? "status-chip warning" : "status-chip good"
          }
        >
          {needsRequirements ? "Needs input" : "Confirmed"}
        </span>
      </div>
      <div className="requirements-grid">
        <Metric
          label="Quantity"
          value={requirementValue(mission, "quantity")}
        />
        <Metric
          label="Total budget"
          value={requirementValue(mission, "budgetCents")}
        />
        <Metric
          label="Must arrive"
          value={requirementValue(mission, "deadlineAt")}
        />
        <Metric label="Branding" value={requirementValue(mission, "branded")} />
      </div>
    </section>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RequirementsForm({
  mission,
  send,
  pending,
}: {
  mission: Mission;
  send: (command: Command, label?: string) => Promise<void>;
  pending: string | null;
}) {
  const [quantity, setQuantity] = useState(mission.requirements.quantity ?? 25);
  const [budget, setBudget] = useState(
    (mission.requirements.budgetCents ?? 50000) / 100,
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
    <form className="question-card" onSubmit={submit}>
      <div>
        <span className="question-label">Reply to Somebody</span>
        <h3>
          {mission.question ??
            "Confirm the details that define a viable quote."}
        </h3>
      </div>
      <div className="input-grid">
        <label>
          Quantity
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
          Delivery deadline
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={branded}
            onChange={(e) => setBranded(e.target.checked)}
          />{" "}
          Custom branding required
        </label>
      </div>
      <button className="button primary" disabled={Boolean(pending)}>
        Confirm and resume <Icon name="arrow" size={16} />
      </button>
    </form>
  );
}

function VendorsSection({ mission }: { mission: Mission }) {
  return (
    <section id="vendors">
      <div className="section-heading outside">
        <div>
          <span className="eyebrow">Vendors</span>
          <h2>Paths in play</h2>
        </div>
        <span className="section-note">
          Evidence v{mission.evidenceVersion}
        </span>
      </div>
      <div className="vendor-grid ops-vendor-grid">
        {mission.vendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            evidence={mission.evidence}
          />
        ))}
      </div>
    </section>
  );
}
function VendorCard({
  vendor,
  evidence,
}: {
  vendor: Vendor;
  evidence: Evidence[];
}) {
  const latest = newestEvidence(vendor, evidence);
  const history = evidence
    .filter((item) => item.vendorId === vendor.id)
    .sort((a, b) => b.observedAt - a.observedAt);
  function changedFields(item: Evidence) {
    return (
      vendor.evaluation.supersededClaims?.find(
        (claim) => claim.evidenceId === item.id,
      )?.fields ?? []
    ).map(titleCase);
  }
  return (
    <article className={`vendor-card ${vendor.evaluation.status}`}>
      <div className="vendor-top">
        <div className={`channel-mark ${vendor.channel.toLowerCase()}`}>
          {channelMark(vendor.channel)}
        </div>
        <div>
          <span className="channel-name">{vendor.channel}</span>
          <h3>{vendor.name}</h3>
          <p>{vendor.product}</p>
        </div>
        <span className={`status-chip ${vendor.evaluation.status}`}>
          {titleCase(vendor.evaluation.status)}
        </span>
      </div>
      <blockquote>
        {latest?.text ?? "No vendor evidence recorded yet."}
      </blockquote>
      {vendor.evaluation.missing.length > 0 && (
        <div className="fact-alert">
          <strong>Missing</strong>
          {vendor.evaluation.missing.map(titleCase).join(" · ")}
        </div>
      )}
      {vendor.evaluation.conflicts.length > 0 && (
        <div className="fact-alert conflict">
          <strong>Contradicted</strong>
          {vendor.evaluation.conflicts.map(titleCase).join(" · ")}
        </div>
      )}
      {vendor.evaluation.requiredQuantity != null && (
        <div className="fact-alert">
          <strong>Qty</strong>
          Required {vendor.evaluation.requiredQuantity}
          {vendor.evaluation.orderQuantity != null &&
            ` · Order ${vendor.evaluation.orderQuantity}`}
        </div>
      )}
      {history.length > 1 && (
        <details className="evidence-history">
          <summary>{history.length} evidence records · view history</summary>
          {history.map((item, index) => {
            const changed = changedFields(item);
            return (
              <div className="history-item" key={item.id}>
                <span
                  className={
                    changed.length ? "history-dot changed" : "history-dot"
                  }
                />
                <p className={changed.length ? "is-stale" : ""}>{item.text}</p>
                <small>
                  {index === 0 ? "Latest" : `Revision ${item.revision}`} ·{" "}
                  {formatTime(item.observedAt, true)}
                  {changed.length > 0 && ` · Replaced: ${changed.join(", ")}`}
                </small>
              </div>
            );
          })}
        </details>
      )}
      <div className="vendor-foot">
        <span>{communicationLabel(vendor.communication ?? "none")}</span>
        <strong>{formatMoney(vendor.evaluation.totalCents)}</strong>
      </div>
    </article>
  );
}

const quoteFields: {
  key: keyof Quote;
  label: string;
  format?: "money" | "date" | "bool";
}[] = [
  { key: "quantity", label: "Quoted qty" },
  { key: "unitCents", label: "Unit", format: "money" },
  { key: "setupCents", label: "Setup", format: "money" },
  { key: "deliveryCents", label: "Delivery", format: "money" },
  { key: "taxCents", label: "Tax", format: "money" },
  { key: "deliveryAt", label: "Arrival", format: "date" },
  { key: "branded", label: "Branded", format: "bool" },
];
function quoteValue(value: unknown, format?: "money" | "date" | "bool") {
  if (value == null) return <span className="unknown">Unknown</span>;
  if (format === "money") return formatMoney(value as number);
  if (format === "date") return formatTime(value as number, true);
  if (format === "bool") return value ? "Yes" : "No";
  return String(value);
}
function Comparison({ mission }: { mission: Mission }) {
  return (
    <section className="panel comparison-panel" id="comparison">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Comparison</span>
          <h2>Normalized facts</h2>
        </div>
        <span className="section-note">
          {mission.ranking?.topVendorId
            ? `Top: ${mission.vendors.find((vendor) => vendor.id === mission.ranking?.topVendorId)?.name ?? mission.ranking.topVendorId}`
            : mission.ranking?.noViableOption
              ? "No viable option"
              : "Waiting on evidence"}
        </span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Vendor</th>
              {quoteFields.map((field) => (
                <th key={field.key}>{field.label}</th>
              ))}
              <th>Order qty</th>
              <th>Landed</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            {mission.vendors.map((vendor) => (
              <tr key={vendor.id} className={vendor.evaluation.status}>
                <th>
                  <span className="table-vendor">
                    {vendor.name}
                    <small>{vendor.channel}</small>
                  </span>
                </th>
                {quoteFields.map((field) => (
                  <td key={field.key}>
                    {quoteValue(
                      vendor.evaluation.quote[field.key],
                      field.format,
                    )}
                  </td>
                ))}
                <td>{vendor.evaluation.orderQuantity ?? "—"}</td>
                <td className="landed">
                  {formatMoney(vendor.evaluation.totalCents)}
                </td>
                <td>
                  <span className={`status-chip ${vendor.evaluation.status}`}>
                    {titleCase(vendor.evaluation.status)}
                  </span>
                  {vendor.evaluation.reasons[0] && (
                    <small className="decision-reason">
                      {vendor.evaluation.reasons[0]}
                    </small>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ApprovalCard({
  mission,
  send,
  pending,
  compact = false,
}: {
  mission: Mission;
  send: (command: Command, label?: string) => Promise<void>;
  pending: string | null;
  compact?: boolean;
}) {
  const recommendation = mission.recommendation;
  const vendor = mission.vendors.find(
    (candidate) => candidate.id === recommendation?.vendorId,
  );
  const decision = recommendation
    ? mission.approvals.find(
        (item) => item.recommendationVersion === recommendation.version,
      )
    : null;
  return (
    <section
      className={`approval-card ${recommendation ? "ready" : "waiting"}`}
      id="approval"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">{compact ? "Approval" : "04 · Human authority"}</span>
          <h2>
            {recommendation
              ? "Recommendation state"
              : "No commitment without you"}
          </h2>
        </div>
        <span
          className={`status-chip ${decision?.decision === "approved" ? "good" : decision?.decision === "rejected" ? "ineligible" : recommendation ? "warning" : "waiting"}`}
        >
          {decision
            ? titleCase(decision.decision)
            : recommendation
              ? "Approval required"
              : "Waiting"}
        </span>
      </div>
      {mission.noViableOption && !recommendation ? (
        <p className="empty-copy">
          No current supplier satisfies the confirmed constraints.
          {` ${mission.noViableOption.reason}`} No commitment effect was created.
        </p>
      ) : recommendation && vendor ? (
        <div className="recommendation-body">
          <div className="recommendation-pick">
            <span>Recommended vendor</span>
            <h3>{vendor.name}</h3>
            <strong>{formatMoney(recommendation.totalCents)}</strong>
            <small>
              Recommendation v{recommendation.version} · evidence v
              {recommendation.evidenceVersion} · order qty{" "}
              {recommendation.orderQuantity ??
                vendor.evaluation.orderQuantity ??
                "—"}
            </small>
          </div>
          <div className="recommendation-reason">
            <span>Why this option</span>
            <p>{recommendation.rationale}</p>
            {recommendation.evidenceVersion !== mission.evidenceVersion && (
              <div className="stale-warning">
                New evidence arrived after this recommendation. Review before
                approving.
              </div>
            )}
          </div>
          {!decision && !compact && (
            <div className="approval-actions">
              <button
                className="button primary"
                disabled={
                  Boolean(pending) ||
                  recommendation.evidenceVersion !== mission.evidenceVersion
                }
                onClick={() =>
                  void send(
                    {
                      type: "approve",
                      recommendationVersion: recommendation.version,
                    },
                    "approve recommendation",
                  )
                }
              >
                <Icon name="approval" /> Approve vendor
              </button>
              <button
                className="button secondary"
                disabled={Boolean(pending)}
                onClick={() =>
                  void send(
                    {
                      type: "reject",
                      recommendationVersion: recommendation.version,
                    },
                    "reject recommendation",
                  )
                }
              >
                Reject
              </button>
            </div>
          )}
          {!decision && compact && (
            <small>Decide in the conversation thread.</small>
          )}
        </div>
      ) : (
        <p className="empty-copy">
          Somebody returns here after comparable evidence exists. Vendor
          commitment stays blocked until approval is persisted.
        </p>
      )}
    </section>
  );
}

function Effects({ mission }: { mission: Mission }) {
  const finalEffects = mission.effects;
  return (
    <section className="panel effects-panel" id="proof">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Effect proof</span>
          <h2>Attempted is not complete</h2>
        </div>
        <span className="section-note">
          {finalEffects.filter((effect) => effect.status === "verified").length}
          /{finalEffects.length} verified
        </span>
      </div>
      {finalEffects.length === 0 ? (
        <p className="empty-copy">
          Post-approval effects appear here with attempt and verification state.
        </p>
      ) : (
        <div className="effect-list">
          {finalEffects.map((effect) => (
            <EffectRow key={effect.key} effect={effect} />
          ))}
        </div>
      )}
    </section>
  );
}
function EffectRow({ effect }: { effect: Effect }) {
  return (
    <div className={`effect-row ${effect.status}`}>
      <span className="effect-icon">
        <Icon name={effect.status === "verified" ? "approval" : "clock"} />
      </span>
      <div>
        <strong>{titleCase(effect.kind)}</strong>
        <span>
          {effect.targetId} · {effect.endpointRef}
        </span>
      </div>
      <div className="effect-proof">
        <span
          className={`status-chip ${effect.status === "verified" ? "good" : "warning"}`}
        >
          {titleCase(effect.status)}
        </span>
        <small>
          {effect.receiptId
            ? `Receipt ${effect.receiptId}`
            : `${effect.attempts} attempt${effect.attempts === 1 ? "" : "s"}`}
        </small>
      </div>
    </div>
  );
}

function DevelopmentControls({
  mission,
  liveAiEnabled,
  send,
  pending,
}: {
  mission: Mission;
  liveAiEnabled: boolean;
  send: (command: Command, label?: string) => Promise<void>;
  pending: string | null;
}) {
  const [clarifyVendor, setClarifyVendor] = useState(
    mission.vendors[0]?.id ?? "",
  );
  const [clarification, setClarification] = useState(
    "Please confirm the delivery date, landed cost, stock, and branding requirement.",
  );
  const [recommendVendor, setRecommendVendor] = useState(
    mission.vendors.find((v) => v.evaluation.status === "eligible")?.id ?? "",
  );
  const [rationale, setRationale] = useState(
    "Best current fit across delivery, budget, availability, and branding constraints.",
  );
  const eligible = useMemo(
    () =>
      mission.vendors.filter(
        (vendor) => vendor.evaluation.status === "eligible",
      ),
    [mission.vendors],
  );
  const executable = mission.effects.filter(
    (effect) => effect.status === "pending",
  );
  const verifiable = mission.effects.filter(
    (effect) => effect.status === "attempted" || effect.status === "unverified",
  );
  return (
    <details className="dev-controls">
      <summary>
        <span>
          <strong>Development only</strong>
          <small>
            Fixture / debug controls — not part of the normal Somebody path
          </small>
        </span>
        <span className="fixture-tag">Fixtures only</span>
      </summary>
      <div className="dev-body">
        <div className="fixture-warning">
          These controls persist Development data. Communication and
          purchase-order effects are simulated fixtures; they do not call
          external providers. Real adapters land from other lanes.
        </div>
        <div className="control-group">
          <div>
            <h3>Worker</h3>
            <p>
              Ask the configured model to inspect current state and choose its
              next tool.
            </p>
          </div>
          <button
            className="button primary"
            disabled={Boolean(pending) || !liveAiEnabled}
            onClick={() => void send({ type: "run_agent" }, "run agent")}
          >
            {pending === "run agent" ? "Running…" : "Run Procurement Agent"}
          </button>
          {!liveAiEnabled && (
            <small className="disabled-note">
              Enable <code>LIVE_AI_ENABLED=true</code> on the server to run a
              live model deliberately.
            </small>
          )}
        </div>
        <div className="control-group">
          <div>
            <h3>Request fixture quotes</h3>
            <p>
              Create deterministic sourcing intents. Evidence arrives separately
              through the inbound observation contract.
            </p>
          </div>
          <div className="button-row">
            {mission.vendors.map((vendor) => (
              <button
                className="button tertiary"
                disabled={Boolean(pending)}
                key={vendor.id}
                onClick={() =>
                  void send(
                    { type: "request_quote", vendorId: vendor.id },
                    `request ${vendor.name}`,
                  )
                }
              >
                {channelMark(vendor.channel)} {vendor.name}
              </button>
            ))}
          </div>
        </div>
        <div className="control-group">
          <div>
            <h3>Ingest fixture observations</h3>
            <p>
              Deliver Development evidence through the same ingest contract
              future Gmail, Unipile, and web adapters will use.
            </p>
          </div>
          <div className="button-row">
            {mission.vendors.map((vendor) => (
              <button
                className="button tertiary"
                disabled={Boolean(pending)}
                key={`obs-${vendor.id}`}
                onClick={() =>
                  void send(
                    {
                      type: "ingest_fixture_observation",
                      vendorId: vendor.id,
                      stage: "initial",
                    },
                    `observe ${vendor.name}`,
                  )
                }
              >
                Observe {vendor.name}
              </button>
            ))}
          </div>
        </div>
        <div className="control-group">
          <div>
            <h3>Ingest an authoritative update</h3>
            <p>
              Later evidence for any configured vendor. History is kept; stale
              claims are superseded.
            </p>
          </div>
          <div className="button-row">
            {mission.vendors.map((vendor) => (
              <button
                className="button tertiary"
                disabled={Boolean(pending)}
                key={`upd-${vendor.id}`}
                onClick={() =>
                  void send(
                    {
                      type: "ingest_fixture_observation",
                      vendorId: vendor.id,
                      stage: "update",
                    },
                    `update ${vendor.name}`,
                  )
                }
              >
                Update {vendor.name}
              </button>
            ))}
          </div>
        </div>
        <form
          className="control-group control-form"
          onSubmit={(event) => {
            event.preventDefault();
            void send(
              {
                type: "clarify_quote",
                vendorId: clarifyVendor,
                question: clarification,
              },
              "clarify quote",
            );
          }}
        >
          <div>
            <h3>Clarify a quote</h3>
            <p>
              Record a targeted follow-up against a deterministic vendor
              identity.
            </p>
          </div>
          <label>
            Vendor
            <select
              value={clarifyVendor}
              onChange={(event) => setClarifyVendor(event.target.value)}
            >
              {mission.vendors.map((vendor) => (
                <option value={vendor.id} key={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grow">
            Question
            <input
              value={clarification}
              onChange={(event) => setClarification(event.target.value)}
              required
            />
          </label>
          <button
            className="button tertiary"
            disabled={Boolean(pending) || !clarifyVendor}
          >
            Queue clarification
          </button>
          <button
            className="button tertiary"
            type="button"
            disabled={Boolean(pending) || !clarifyVendor}
            onClick={() =>
              void send(
                {
                  type: "ingest_fixture_observation",
                  vendorId: clarifyVendor,
                  stage: "clarification",
                },
                "observe clarification",
              )
            }
          >
            Observe clarification
          </button>
        </form>
        <form
          className="control-group control-form"
          onSubmit={(event) => {
            event.preventDefault();
            void send(
              { type: "recommend", vendorId: recommendVendor, rationale },
              "create recommendation",
            );
          }}
        >
          <div>
            <h3>Recommend</h3>
            <p>Only vendors the domain layer marks eligible can be selected.</p>
          </div>
          <label>
            Eligible vendor
            <select
              value={recommendVendor}
              onChange={(event) => setRecommendVendor(event.target.value)}
              required
            >
              <option value="">Choose…</option>
              {eligible.map((vendor) => (
                <option value={vendor.id} key={vendor.id}>
                  {vendor.name} · {formatMoney(vendor.evaluation.totalCents)}
                </option>
              ))}
            </select>
          </label>
          <label className="grow">
            Rationale
            <input
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
              required
            />
          </label>
          <button
            className="button tertiary"
            disabled={Boolean(pending) || !recommendVendor}
          >
            Recommend
          </button>
          <button
            className="button tertiary"
            type="button"
            disabled={Boolean(pending) || !mission.ranking?.noViableOption}
            onClick={() =>
              void send(
                {
                  type: "record_no_viable_option",
                  reason:
                    "Every fully evaluated supplier fails a hard constraint.",
                },
                "record no viable option",
              )
            }
          >
            Record no viable option
          </button>
        </form>
        {(executable.length > 0 || verifiable.length > 0) && (
          <div className="control-group">
            <div>
              <h3>Effect lifecycle</h3>
              <p>
                Execute and independently verify each logical effect. Retries
                reuse the same key.
              </p>
            </div>
            <div className="effect-controls">
              {executable.map((effect) => (
                <button
                  className="button tertiary"
                  disabled={Boolean(pending)}
                  key={effect.key}
                  onClick={() =>
                    void send(
                      { type: "execute_effect", effectKey: effect.key },
                      `execute ${effect.kind}`,
                    )
                  }
                >
                  Execute {titleCase(effect.kind)}
                </button>
              ))}
              {verifiable.map((effect) => (
                <button
                  className="button tertiary"
                  disabled={Boolean(pending)}
                  key={effect.key}
                  onClick={() =>
                    void send(
                      { type: "verify_effect", effectKey: effect.key },
                      `verify ${effect.kind}`,
                    )
                  }
                >
                  Verify {titleCase(effect.kind)}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="control-group">
          <div>
            <h3>Completion gate</h3>
            <p>
              Attempt completion. Domain policy will fail closed until every
              required effect is verified.
            </p>
          </div>
          <button
            className="button tertiary"
            disabled={Boolean(pending)}
            onClick={() =>
              void send({ type: "complete_mission" }, "complete mission")
            }
          >
            Check completion
          </button>
        </div>
      </div>
    </details>
  );
}

function Notice({
  notice,
}: {
  notice: { kind: "ok" | "error"; text: string };
}) {
  return (
    <div className={`notice ${notice.kind}`} role="status">
      {notice.text}
    </div>
  );
}
