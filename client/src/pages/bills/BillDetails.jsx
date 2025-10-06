import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "../../components/Navigation";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../utils/api";
import { useCurrency } from "../../hooks/useCurrency";
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
} from "../../utils/formatters";

const createEmptyAiState = () => ({
  summary: null,
  suggestions: [],
  actions: [],
  version: 0,
});

export default function BillDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const api = useApi(token);
  const { currency: defaultCurrency } = useCurrency();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [aiState, setAiState] = useState(createEmptyAiState);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [displayedSummaryLines, setDisplayedSummaryLines] = useState([]);
  const [isTypingSummary, setIsTypingSummary] = useState(false);
  const summaryTypingTimeoutRef = useRef(null);

  const paymentTimeline = useMemo(
    () => buildPaymentTimeline(bill, defaultCurrency),
    [bill, defaultCurrency]
  );
  const riskProfile = useMemo(
    () => computeRiskProfile(bill, paymentTimeline, defaultCurrency),
    [bill, paymentTimeline, defaultCurrency]
  );

  const fetchBill = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getBills();
      const record = response?.data?.find((item) => item._id === id);

      if (!record) {
        setError(
          "We couldn't find that bill anymore. Try refreshing your list."
        );
        setBill(null);
        return;
      }

      setBill(record);
    } catch (err) {
      setError(err.message ?? "Unable to load bill details");
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  const buildAiQuery = useCallback(
    (record, followUp) => {
      const formattedDueDate = record.dueDate
        ? formatDate(record.dueDate)
        : "Unknown due date";

      const basePrompt = `You are Renewly's embedded finance co-pilot. Generate a thorough, user-friendly briefing for the bill below using ONLY the data supplied. Respond with exactly four short paragraphs in this order:
1. **Payment status & urgency** – two to three sentences on current status, due timing, payment method, and any gaps in the data.
2. **Budget & variance lens** – two to three sentences on amount impact, cadence, historical payment signals, and whether the trend looks healthy.
3. **Action checklist** – two to three sentences with concrete, bill-specific actions or safeguards. If data is missing, surface what needs verification instead of guessing.
4. **Clarifications & watchpoints** – two to three sentences highlighting assumptions, fields needing updates, and what indicators to monitor next.

Keep the tone supportive yet direct, reference only this bill, avoid lists or bullet formatting, and do not compare to other bills.

Bill: ${record.name}. Amount: ${formatCurrency(
        record.amount,
        record.currency || defaultCurrency
      )}. Status: ${
        record.status
      }. Due date: ${formattedDueDate}. Payment method: ${
        record.paymentMethod || "Unspecified"
      }. Auto pay: ${record.autoPay ? "enabled" : "disabled"}. Category: ${
        record.category || "Uncategorized"
      }. Notes: ${record.notes || "None provided"}. Last paid: ${
        record.paidDate ? formatDate(record.paidDate) : "Unknown"
      }.`;

      if (followUp) {
        return `${basePrompt} User follow-up question: ${followUp}`;
      }

      return basePrompt;
    },
    [defaultCurrency]
  );

  const fetchAiSummary = useCallback(
    async (record, { silent = false, followUp } = {}) => {
      if (!record) return;

      setAiError(null);
      if (!silent) {
        setAiLoading(true);
      }

      try {
        const query = buildAiQuery(record, followUp);
        const response = await api.assistantQuery(query, {
          entityType: "bill",
          entityId: record._id,
          entity: record,
          followUp,
        });

        const summary = response?.data?.response ?? null;
        const suggestions = response?.data?.suggestions ?? [];
        const actions = response?.data?.actions ?? [];

        setAiState({
          summary,
          suggestions,
          actions,
          version: Date.now(),
        });
      } catch (err) {
        setAiError(err.message ?? "Unable to generate AI insights right now");
        setAiState(createEmptyAiState());
      } finally {
        setAiLoading(false);
      }
    },
    [api, buildAiQuery]
  );

  useEffect(() => {
    fetchBill();
  }, [fetchBill]);

  useEffect(() => {
    if (bill) {
      fetchAiSummary(bill);
    }
  }, [bill, fetchAiSummary]);

  useEffect(() => {
    if (aiLoading) {
      if (summaryTypingTimeoutRef.current) {
        clearTimeout(summaryTypingTimeoutRef.current);
      }
      setDisplayedSummaryLines([]);
      setIsTypingSummary(false);
    }
  }, [aiLoading]);

  const summaryText =
    typeof aiState.summary === "string"
      ? aiState.summary
      : aiState.summary?.text;
  const summaryVersion = aiState.version;

  useEffect(() => {
    if (summaryTypingTimeoutRef.current) {
      clearTimeout(summaryTypingTimeoutRef.current);
    }

    if (!summaryText) {
      setDisplayedSummaryLines([]);
      setIsTypingSummary(false);
      return undefined;
    }

    const paragraphTexts = summaryText
      .split(/\n+/)
      .map((segment) => segment.trim())
      .filter(Boolean);

    const paragraphs =
      paragraphTexts.length > 0 ? paragraphTexts : [summaryText.trim()];

    const wordsByParagraph = paragraphs.map((paragraph) =>
      paragraph.split(/\s+/).filter(Boolean)
    );

    setDisplayedSummaryLines(paragraphs.map(() => ""));
    setIsTypingSummary(true);

    let paragraphIndex = 0;
    let wordIndex = 0;

    const typeNextWord = () => {
      const words = wordsByParagraph[paragraphIndex];
      if (!words || words.length === 0) {
        paragraphIndex += 1;
        wordIndex = 0;
      } else {
        const nextWord = words[wordIndex];
        setDisplayedSummaryLines((prev) => {
          const next = [...prev];
          const existing = next[paragraphIndex];
          next[paragraphIndex] = existing
            ? `${existing} ${nextWord}`
            : nextWord;
          return next;
        });

        wordIndex += 1;

        if (wordIndex >= words.length) {
          paragraphIndex += 1;
          wordIndex = 0;
        }
      }

      if (paragraphIndex < wordsByParagraph.length) {
        summaryTypingTimeoutRef.current = setTimeout(typeNextWord, 120);
      } else {
        setIsTypingSummary(false);
        summaryTypingTimeoutRef.current = null;
      }
    };

    summaryTypingTimeoutRef.current = setTimeout(typeNextWord, 220);

    return () => {
      if (summaryTypingTimeoutRef.current) {
        clearTimeout(summaryTypingTimeoutRef.current);
        summaryTypingTimeoutRef.current = null;
      }
    };
  }, [summaryText, summaryVersion]);

  const goBack = () => navigate("/bills");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner text="Loading bill details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navigation />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <ErrorMessage error={error} onRetry={fetchBill} />
          <button
            type="button"
            onClick={goBack}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            ← Back to bills
          </button>
        </div>
      </div>
    );
  }

  const amountDisplay = formatCurrency(
    bill.amount,
    bill.currency || defaultCurrency
  );
  const dueDateDisplay = bill.dueDate ? formatDate(bill.dueDate) : "Not set";
  const dueRelative = bill.dueDate ? formatRelativeDate(bill.dueDate) : "";
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navigation />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 sm:w-auto"
          >
            ← Back to bills
          </button>
          <div className="flex w-full flex-col items-start gap-3 text-left sm:w-auto">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Bill overview
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {bill.name}
            </h1>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-xl font-semibold text-gray-900">
                {amountDisplay}
              </span>
              <StatusBadge status={bill.status} />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-slate-900 to-black p-6 sm:p-8 text-amber-100 shadow-2xl">
            <div
              className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-orange-400/10 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300/90">
                    AI payment command
                  </p>
                  <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
                    Intelligent bill briefing
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-amber-100/80">
                    Renewly’s co-pilot fuses due timing, payment habits, and
                    budget health into a live dossier so you can stay ahead of
                    late fees and cash flow surprises.
                  </p>
                </div>
                <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto lg:items-start">
                  <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-left text-sm text-amber-100 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">
                      Amount due
                    </p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {amountDisplay}
                    </p>
                    <p className="text-xs text-amber-200/90">
                      {dueDateDisplay}
                      {dueRelative ? ` · ${dueRelative}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchAiSummary(bill)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-amber-500/30 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-amber-100 transition hover:bg-amber-500/50"
                  >
                    Refresh briefing
                  </button>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-inner backdrop-blur">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-200">
                      Live AI briefing
                    </h3>
                    <p className="mt-1 text-xs text-amber-200/80">
                      Streaming adaptive guidance for this bill only.
                    </p>
                    <div className="mt-4 space-y-4">
                      {aiLoading ? (
                        <div className="flex items-center gap-3 text-sm text-amber-100">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" />
                          <span>Generating the latest briefing…</span>
                        </div>
                      ) : aiError ? (
                        <div className="text-sm text-rose-200">{aiError}</div>
                      ) : summaryText ? (
                        <div className="space-y-3">
                          {displayedSummaryLines
                            .filter((line) => line.length > 0)
                            .map((line, index) => (
                              <p
                                key={`${line}-${index}`}
                                className="text-sm leading-relaxed text-amber-50 transition-opacity duration-500"
                                style={{ opacity: 1 }}
                              >
                                {line}
                              </p>
                            ))}
                          {isTypingSummary && (
                            <div className="flex items-center gap-2 text-xs text-amber-200/80">
                              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-200" />
                              <span>Streaming more insights…</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-amber-200/80">
                          Insights will appear here as soon as the assistant
                          gathers enough context. Try refreshing in a moment.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                          Payment timeline
                        </h3>
                        <p className="text-[0.7rem] uppercase tracking-wide text-amber-200/70">
                          {bill.paymentMethod || "Payment method pending"}
                        </p>
                      </div>
                      <span className="rounded-full bg-black/30 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-100/80">
                        {bill.autoPay ? "Auto pay" : "Manual"}
                      </span>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-amber-100">
                      {paymentTimeline.length > 0 ? (
                        paymentTimeline.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {item.primary}
                              </p>
                              {item.secondary && (
                                <p className="text-xs text-amber-200/80">
                                  {item.secondary}
                                </p>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-amber-100">
                              {item.value}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-amber-200/80">
                          Add a due date, payment method, or last payment to
                          unlock proactive scheduling insights.
                        </p>
                      )}
                    </div>
                  </div>

                  {riskProfile && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                      <div className="flex items-start gap-4">
                        <div className="relative h-20 w-20">
                          <div className="absolute inset-0 rounded-full bg-black/40" />
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: `conic-gradient(${
                                riskProfile.accent
                              } ${
                                riskProfile.score * 3.6
                              }deg, rgba(255,255,255,0.08) ${
                                riskProfile.score * 3.6
                              }deg)`,
                            }}
                          />
                          <div className="absolute inset-2 flex items-center justify-center rounded-full bg-amber-950/80 text-lg font-semibold text-white">
                            {riskProfile.score}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-200">
                            Risk radar
                          </h3>
                          <p className="text-lg font-semibold text-white">
                            {riskProfile.level}
                          </p>
                          <p className="text-xs leading-relaxed text-amber-100/80">
                            {riskProfile.narrative}
                          </p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2 text-xs text-amber-100/80">
                        {riskProfile.signals.map((signal, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-300" />
                            <div>
                              <p className="font-semibold text-amber-100">
                                {signal.label}
                              </p>
                              <p className="text-amber-200/80">
                                {signal.detail}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Supplementary sections intentionally removed to keep focus on AI co-pilot */}
        </div>
      </main>
    </div>
  );
}

function buildPaymentTimeline(bill, defaultCurrency) {
  if (!bill) return [];

  const items = [];
  const currencyCode = bill.currency || defaultCurrency;

  if (bill.dueDate) {
    items.push({
      id: `${bill._id ?? "bill"}-due`,
      primary: formatDate(bill.dueDate),
      secondary: formatRelativeDate(bill.dueDate),
      value: bill.status === "overdue" ? "Overdue" : "Scheduled",
    });
  }

  if (bill.paidDate) {
    items.push({
      id: `${bill._id ?? "bill"}-paid`,
      primary: formatDate(bill.paidDate),
      secondary: `Paid ${formatRelativeDate(bill.paidDate)}`,
      value: "Last payment",
    });
  }

  items.push({
    id: `${bill._id ?? "bill"}-amount`,
    primary: "Cycle amount",
    secondary: bill.category ? `Category · ${bill.category}` : null,
    value: formatCurrency(bill.amount, currencyCode),
  });

  items.push({
    id: `${bill._id ?? "bill"}-automation`,
    primary: bill.paymentMethod || "Funding method pending",
    secondary: bill.autoPay
      ? "Auto pay active—confirm the funding account has capacity"
      : "Manual payment required—consider enabling auto pay to avoid fees",
    value: bill.autoPay ? "Auto pay" : "Manual",
  });

  return items;
}

function computeRiskProfile(bill, paymentTimeline, defaultCurrency) {
  if (!bill) return null;

  const now = new Date();
  const nextDueDate = bill.dueDate ? new Date(bill.dueDate) : null;
  const currencyCode = bill.currency || defaultCurrency;

  let score = 35;

  if (bill.status === "overdue") {
    score += 30;
  } else if (bill.status === "pending") {
    score += 10;
  }

  if (!bill.autoPay) {
    score += 15;
  }

  if (bill.amount >= 250) {
    score += 20;
  } else if (bill.amount >= 120) {
    score += 12;
  } else if (bill.amount >= 60) {
    score += 6;
  }

  if (nextDueDate && !Number.isNaN(nextDueDate.getTime())) {
    const diffDays = Math.round(
      (nextDueDate.getTime() - now.getTime()) / 86400000
    );

    if (diffDays <= 0) {
      score += 25;
    } else if (diffDays <= 3) {
      score += 18;
    } else if (diffDays <= 7) {
      score += 12;
    }
  } else {
    score += 5;
  }

  score = Math.max(5, Math.min(95, Math.round(score)));

  const level =
    score >= 70
      ? "Attention needed"
      : score >= 45
      ? "Monitor closely"
      : "Steady";
  const accent = score >= 70 ? "#f97316" : score >= 45 ? "#fcd34d" : "#34d399";

  const narrative =
    level === "Attention needed"
      ? "This bill is in a risky window. Confirm payment status or accelerate repayment to avoid fees."
      : level === "Monitor closely"
      ? "Keep an eye on due timing and automation settings so nothing slips through."
      : "No urgent risks detected. Maintain your current cadence and keep monitoring.";

  const signals = [];

  if (nextDueDate && !Number.isNaN(nextDueDate.getTime())) {
    const diffDays = Math.round(
      (nextDueDate.getTime() - now.getTime()) / 86400000
    );
    signals.push({
      label: "Due window",
      detail:
        diffDays >= 0
          ? `Next payment in ${diffDays} day${
              diffDays === 1 ? "" : "s"
            } (${formatDate(nextDueDate)}).`
          : `Past due by ${Math.abs(diffDays)} day${
              Math.abs(diffDays) === 1 ? "" : "s"
            } (${formatDate(nextDueDate)}).`,
    });
  } else {
    signals.push({
      label: "Due window",
      detail: "No due date stored. Add one to unlock proactive reminders.",
    });
  }

  signals.push({
    label: "Automation",
    detail: bill.autoPay
      ? "Auto pay enabled—verify the funding account has capacity."
      : "Manual payment required—set a reminder or enable auto pay to stay protected.",
  });

  signals.push({
    label: "Spend impact",
    detail: `This cycle’s amount is ${formatCurrency(
      bill.amount,
      currencyCode
    )}.`,
  });

  const timelineNote = paymentTimeline.find((item) => item.id.includes("paid"));

  if (timelineNote) {
    signals.push({
      label: "Recent activity",
      detail:
        timelineNote.secondary || "Track last payment to keep history fresh.",
    });
  }

  return { score, level, accent, narrative, signals };
}
