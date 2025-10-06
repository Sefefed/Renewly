import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "../../components/Navigation";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../utils/api";
import { useCurrency } from "../../hooks/useCurrency";
import { formatCurrency, formatDate } from "../../utils/formatters";

const frequencyCopy = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const createEmptyAiState = () => ({
  summary: null,
  suggestions: [],
  actions: [],
  version: 0,
});

export default function SubscriptionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const api = useApi(token);
  const { currency: defaultCurrency } = useCurrency();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [aiState, setAiState] = useState(createEmptyAiState);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [displayedSummaryLines, setDisplayedSummaryLines] = useState([]);
  const [isTypingSummary, setIsTypingSummary] = useState(false);
  const summaryTypingTimeoutRef = useRef(null);

  const monthlyPrice = useMemo(() => {
    if (!subscription) return null;
    const multiplier =
      {
        daily: 30,
        weekly: 4.345,
        monthly: 1,
        yearly: 1 / 12,
      }[subscription.frequency] ?? 1;

    return subscription.price * multiplier;
  }, [subscription]);
  const paymentSchedule = useMemo(
    () => buildPaymentSchedule(subscription, defaultCurrency),
    [subscription, defaultCurrency]
  );
  const riskProfile = useMemo(
    () =>
      computeRiskProfile(
        subscription,
        paymentSchedule,
        monthlyPrice,
        defaultCurrency
      ),
    [subscription, paymentSchedule, monthlyPrice, defaultCurrency]
  );

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getSubscriptions();
      const record = response?.data?.find((item) => item._id === id);

      if (!record) {
        setError(
          "We couldn't locate that subscription. It may have been deleted or updated."
        );
        setSubscription(null);
        return;
      }

      setSubscription(record);
    } catch (err) {
      setError(err.message ?? "Unable to load subscription details");
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  const buildAiQuery = useCallback(
    (record, followUp) => {
      const basePrompt = `You are Renewly's embedded finance co-pilot. Create a thorough, user-friendly briefing for the subscription below using ONLY the data supplied. Respond with exactly four short paragraphs in this order:
1. **Status & Renewal Outlook** – two to three sentences about current status, renewal timing, payment method, and any gaps in the data.
2. **Spend & Utilization Lens** – two to three sentences about cost cadence, category impact, usage notes, and whether the spend trajectory looks healthy.
3. **Actionable Moves** – two to three sentences describing concrete, subscription-specific actions or safeguards. If data is missing, call it out and suggest how to fill the gap instead of guessing.
4. **Clarifications & Watchpoints** – two to three sentences summarizing assumptions, missing fields that need attention, and what signals to monitor next.

Keep the tone supportive yet direct, reference only this subscription, avoid lists or bullet formatting, and do not compare to other services.

Subscription: ${record.name}. Price: ${formatCurrency(
        record.price,
        record.currency || defaultCurrency
      )} (${frequencyCopy[record.frequency] ?? record.frequency}). Status: ${
        record.status
      }. Renewal date: ${
        record.renewalDate ? formatDate(record.renewalDate) : "Unknown"
      }. Payment method: ${record.paymentMethod || "Unspecified"}. Category: ${
        record.category || "Uncategorized"
      }. Description: ${
        record.description || "No description provided"
      }. Notes: ${record.notes || "None provided"}.`;

      if (followUp) {
        return `${basePrompt} The user specifically wants to know: ${followUp}`;
      }

      return basePrompt;
    },
    [defaultCurrency]
  );

  const fetchAiSummary = useCallback(
    async (record, { followUp, silent = false } = {}) => {
      if (!record) return;

      setAiError(null);
      if (!silent) {
        setAiLoading(true);
      }

      try {
        const query = buildAiQuery(record, followUp);
        const response = await api.assistantQuery(query, {
          entityType: "subscription",
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
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    if (subscription) {
      fetchAiSummary(subscription);
    }
  }, [subscription, fetchAiSummary]);

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

  const goBack = () => navigate("/subscriptions");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner text="Loading subscription details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navigation />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <ErrorMessage error={error} onRetry={fetchSubscription} />
          <button
            type="button"
            onClick={goBack}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            ← Back to subscriptions
          </button>
        </div>
      </div>
    );
  }

  const priceDisplay = formatCurrency(
    subscription.price,
    subscription.currency || defaultCurrency
  );
  const monthlyDisplay = monthlyPrice
    ? formatCurrency(monthlyPrice, subscription.currency || defaultCurrency)
    : null;
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
            ← Back to subscriptions
          </button>
          <div className="flex w-full flex-col items-start gap-3 text-left sm:w-auto">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Subscription intelligence
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {subscription.name}
            </h1>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-xl font-semibold text-gray-900">
                {priceDisplay}
              </span>
              <StatusBadge status={subscription.status} />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-6 sm:p-8 text-indigo-100 shadow-2xl">
            <div
              className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-300/90">
                    AI command center
                  </p>
                  <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
                    Intelligent spend briefing
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-indigo-100/80">
                    Renewly’s co-pilot fuses renewal timing, behavioural
                    signals, and budget objectives into a live dossier so you
                    can take action before surprises land on your statement.
                  </p>
                </div>
                <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto lg:items-start">
                  <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-left text-sm text-indigo-100 shadow-inner">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200/90">
                      Current cost
                    </p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {priceDisplay}
                    </p>
                    {monthlyDisplay && (
                      <p className="text-xs text-indigo-200/90">
                        ≈ {monthlyDisplay} normalized monthly
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchAiSummary(subscription)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-indigo-500/30 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-100 transition hover:bg-indigo-500/50"
                  >
                    Refresh briefing
                  </button>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-inner backdrop-blur">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-200">
                      Live AI briefing
                    </h3>
                    <p className="mt-1 text-xs text-indigo-200/80">
                      Streaming adaptive guidance for this subscription only.
                    </p>
                    <div className="mt-4 space-y-4">
                      {aiLoading ? (
                        <div className="flex items-center gap-3 text-sm text-indigo-100">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-300" />
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
                                className="text-sm leading-relaxed text-indigo-50 transition-opacity duration-500"
                                style={{ opacity: 1 }}
                              >
                                {line}
                              </p>
                            ))}
                          {isTypingSummary && (
                            <div className="flex items-center gap-2 text-xs text-indigo-200/80">
                              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-indigo-200" />
                              <span>Streaming more insights…</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-indigo-200/80">
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
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
                          Payment schedule
                        </h3>
                        <p className="text-[0.7rem] uppercase tracking-wide text-indigo-200/70">
                          {subscription.paymentMethod}
                        </p>
                      </div>
                      <span className="rounded-full bg-black/30 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-indigo-100/80">
                        {frequencyCopy[subscription.frequency] ??
                          subscription.frequency}
                      </span>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-indigo-100">
                      {paymentSchedule.length > 0 ? (
                        paymentSchedule.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {item.formattedDate}
                              </p>
                              <p className="text-xs text-indigo-200/80">
                                {item.relative}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-indigo-100">
                              {item.amount}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-indigo-200/80">
                          Add a renewal date and payment method to unlock
                          proactive scheduling insights.
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
                          <div className="absolute inset-2 flex items-center justify-center rounded-full bg-indigo-950/80 text-lg font-semibold text-white">
                            {riskProfile.score}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
                            Risk radar
                          </h3>
                          <p className="text-lg font-semibold text-white">
                            {riskProfile.level}
                          </p>
                          <p className="text-xs leading-relaxed text-indigo-100/80">
                            {riskProfile.narrative}
                          </p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2 text-xs text-indigo-100/80">
                        {riskProfile.signals.map((signal, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-300" />
                            <div>
                              <p className="font-semibold text-indigo-100">
                                {signal.label}
                              </p>
                              <p className="text-indigo-200/80">
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

function buildPaymentSchedule(subscription, defaultCurrency) {
  if (!subscription?.renewalDate) return [];

  const currencyCode = subscription.currency || defaultCurrency;
  const schedule = [];
  const now = new Date();
  let cursor = new Date(subscription.renewalDate);

  if (Number.isNaN(cursor.getTime())) {
    return [];
  }

  while (cursor < now) {
    const nextCursor = addInterval(cursor, subscription.frequency);
    if (!nextCursor) break;
    cursor = nextCursor;
  }

  for (let index = 0; index < 3; index += 1) {
    schedule.push({
      id: `${subscription._id ?? "subscription"}-payment-${index}`,
      date: new Date(cursor),
      formattedDate: formatDate(cursor),
      relative: formatRelativeToToday(cursor),
      amount: formatCurrency(subscription.price, currencyCode),
    });

    const next = addInterval(cursor, subscription.frequency);
    if (!next) break;
    cursor = next;
  }

  return schedule;
}

function addInterval(date, frequency) {
  const next = new Date(date.getTime());

  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      return null;
  }

  return next;
}

function formatRelativeToToday(date) {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / 86400000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffDays) >= 14) {
    const diffWeeks = Math.round(diffDays / 7);
    return formatter.format(diffWeeks, "week");
  }

  return formatter.format(diffDays, "day");
}

function computeRiskProfile(
  subscription,
  paymentSchedule,
  monthlyPrice,
  defaultCurrency
) {
  if (!subscription) return null;

  const currencyCode = subscription.currency || defaultCurrency;
  const now = new Date();
  const nextPaymentDate = paymentSchedule[0]?.date
    ? new Date(paymentSchedule[0].date)
    : subscription.renewalDate
    ? new Date(subscription.renewalDate)
    : null;

  let score = 35;

  if (subscription.status !== "active") {
    score += 25;
  }

  if (subscription.price >= 150) {
    score += 25;
  } else if (subscription.price >= 80) {
    score += 15;
  } else if (subscription.price >= 40) {
    score += 8;
  }

  if (typeof monthlyPrice === "number" && monthlyPrice > 80) {
    score += 10;
  }

  if (nextPaymentDate) {
    const daysUntil = Math.round(
      (nextPaymentDate.getTime() - now.getTime()) / 86400000
    );

    if (daysUntil <= 7) {
      score += 20;
    } else if (daysUntil <= 14) {
      score += 12;
    } else if (daysUntil < 0) {
      score += 15;
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
  const accent = score >= 70 ? "#f97316" : score >= 45 ? "#38bdf8" : "#34d399";

  const narrative =
    level === "Attention needed"
      ? "This subscription is trending toward higher spend soon. Review usage or negotiate before the next renewal."
      : level === "Monitor closely"
      ? "Keep an eye on utilization and payment cadence to stay ahead of potential surprises."
      : "No immediate risks detected. Maintain current strategy and keep monitoring engagement.";

  const signals = [];

  if (nextPaymentDate) {
    const diffDays = Math.round(
      (nextPaymentDate.getTime() - now.getTime()) / 86400000
    );
    signals.push({
      label: "Renewal window",
      detail:
        diffDays >= 0
          ? `Next charge in ${diffDays} day${
              diffDays === 1 ? "" : "s"
            } (${formatDate(nextPaymentDate)}).`
          : `Last charged ${Math.abs(diffDays)} day${
              Math.abs(diffDays) === 1 ? "" : "s"
            } ago.`,
    });
  } else {
    signals.push({
      label: "Renewal window",
      detail: "No renewal date stored. Set one to unlock proactive reminders.",
    });
  }

  signals.push({
    label: "Spend intensity",
    detail: `Currently budgeted at ${formatCurrency(
      subscription.price,
      currencyCode
    )} per ${frequencyCopy[subscription.frequency] ?? subscription.frequency}.`,
  });

  signals.push({
    label: "Status",
    detail: `Marked as ${subscription.status}.`,
  });

  return { score, level, accent, narrative, signals };
}
