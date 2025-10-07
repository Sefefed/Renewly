import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "../../components/Navigation";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../utils/api";
import { formatCurrency } from "../../utils/formatters";
import { useAiBriefing } from "../../hooks/useAiBriefing";
import { useSubscriptionDetails } from "./hooks/useSubscriptionDetails";
import { buildSubscriptionPrompt } from "./utils/prompts";
import { pickSubscriptionAngle } from "./constants/angles";

export default function SubscriptionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const api = useApi(token);
  const {
    subscription,
    loading,
    error,
    refresh: refreshSubscription,
    defaultCurrency,
    monthlyPrice,
    paymentSchedule,
    riskProfile,
    frequencyLabel,
  } = useSubscriptionDetails(id, api);

  const buildPrompt = useCallback(
    (entity, followUp, angle) =>
      buildSubscriptionPrompt({
        subscription: entity,
        defaultCurrency,
        angle,
        followUp,
      }),
    [defaultCurrency]
  );

  const {
    aiState,
    aiLoading,
    aiError,
    displayedLines,
    isTyping,
    refresh: refreshBriefing,
    analysisAngle,
  } = useAiBriefing({
    entity: subscription,
    buildPrompt,
    api,
    entityType: "subscription",
    pickAngle: pickSubscriptionAngle,
  });

  const goBack = useCallback(() => navigate("/subscriptions"), [navigate]);
  const refreshAi = useCallback(() => refreshBriefing(), [refreshBriefing]);

  const priceDisplay = useMemo(() => {
    if (!subscription) return null;
    return formatCurrency(
      subscription.price,
      subscription.currency || defaultCurrency
    );
  }, [subscription, defaultCurrency]);

  const monthlyDisplay = useMemo(() => {
    if (!subscription || !monthlyPrice) return null;
    return formatCurrency(
      monthlyPrice,
      subscription.currency || defaultCurrency
    );
  }, [monthlyPrice, subscription, defaultCurrency]);

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
          <ErrorMessage error={error} onRetry={refreshSubscription} />
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
  return (
    <div className="bg-gradient-to-br from-[#0A0F1C] via-[#121826] to-[#1C1F26] animate-gradient-slow text-white min-h-screen">
      <Navigation />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 bg-transparent border border-gray-600 text-gray-300 hover:border-cyan-400 hover:text-cyan-400 font-medium px-4 py-2 rounded-xl transition-all duration-300"
          >
            ← Back to subscriptions
          </button>
          <div className="flex w-full flex-col items-start gap-3 text-left sm:w-auto">
            <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">
              Subscription intelligence
            </p>
            <h1 className="text-white text-3xl font-bold">
              {subscription.name}
            </h1>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-cyan-400 text-xl font-semibold">
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
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">
                    Renewly’s co-pilot fuses renewal timing, behavioural
                    signals, and budget objectives into a live dossier so you
                    can take action before surprises land on your statement.
                  </p>
                </div>
                <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto lg:items-start">
                  <div className="bg-[#111827]/70 backdrop-blur-xl border border-gray-700/40 rounded-2xl p-6 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
                    <p className="text-gray-400 text-sm font-medium mb-2">
                      Current cost
                    </p>
                    <p className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)] mb-1">
                      {priceDisplay}
                    </p>
                    {monthlyDisplay && (
                      <p className="text-xs text-gray-300">
                        ≈ {monthlyDisplay} normalized monthly
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={refreshAi}
                    disabled={aiLoading}
                    className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-6 py-2 rounded-2xl shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
                  >
                    Refresh briefing
                  </button>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-inner backdrop-blur">
                    <h3 className="bg-[#111827]/70 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                      Live AI briefing
                    </h3>
                    <p className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-widest">
                      Streaming adaptive guidance for this subscription only.
                    </p>
                    {analysisAngle && (
                      <div className="bg-[#1C2433]/70 rounded-xl p-4 border border-gray-700/50">
                        <span className="text-cyan-400 font-semibold mb-1">Lens</span>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-indigo-50">
                          {analysisAngle.label}
                        </span>
                      </div>
                    )}
                    {analysisAngle?.tagline && (
                      <p className="mt-1 text-[0.7rem] uppercase tracking-wide text-indigo-200/60">
                        {analysisAngle.tagline}
                      </p>
                    )}
                    <div className="mt-4 space-y-4">
                      {aiLoading ? (
                        <div className="flex items-center gap-3 text-sm text-indigo-100">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-300" />
                          <span>Generating the latest briefing…</span>
                        </div>
                      ) : aiError ? (
                        <div className="text-sm text-rose-200">{aiError}</div>
                      ) : aiState.summary ? (
                        <div className="space-y-3">
                          {displayedLines
                            .filter((line) => line.length > 0)
                            .map((line, index) => (
                              <p
                                key={`${line}-${index}`}
                                className="text-sm leading-relaxed text-indigo-50 transition-opacity duration-500"
                              >
                                {line}
                              </p>
                            ))}
                          {isTyping && (
                            <div className="flex items-center gap-2 text-xs text-indigo-200/80">
                              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-indigo-200" />
                              <span>Streaming more insights…</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-indigo-200/80">
                          {analysisAngle?.fallbackHint ||
                            "Insights will appear here as soon as the assistant gathers enough context. Try refreshing in a moment."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-gray-400 text-sm font-medium">
                          Payment schedule
                        </h3>
                        <p className="text-[0.7rem] uppercase tracking-wide text-gray-300">
                          {subscription.paymentMethod || "Payment method TBD"}
                        </p>
                      </div>
                      <span className="rounded-full bg-black/30 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-gray-400">
                        {frequencyLabel ?? subscription.frequency}
                      </span>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-indigo-100">
                      {paymentSchedule.length > 0 ? (
                        paymentSchedule.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-xl border border-gray-700/30 bg-[#0A0F1C]/60 px-3 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-300">
                                {item.formattedDate}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.relative}
                              </p>
                            </div>
                            <p className="text-lg font-semibold text-cyan-400">
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
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-white">
                            Risk radar
                          </h3>
                          <p className="text-sm font-medium text-yellow-400">
                            {riskProfile.level}
                          </p>
                          <p className="text-sm mb-6 leading-relaxed text-gray-400">
                            {riskProfile.narrative}
                          </p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2 text-xs text-indigo-100/80">
                        {riskProfile.signals.map((signal, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-300" />
                            <div>
                              <p className="font-medium text-cyan-400">
                                {signal.label}
                              </p>
                              <p className="text-gray-300">
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
