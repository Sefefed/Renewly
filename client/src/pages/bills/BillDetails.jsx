import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "../../components/Navigation";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../utils/api";
import { useAiBriefing } from "../../hooks/useAiBriefing";
import { useBillDetails } from "./hooks/useBillDetails";
import { pickBillAngle } from "./constants/angles";
import { buildBillPrompt } from "./utils/prompts";

export default function BillDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const api = useApi(token);
  const {
    bill,
    loading,
    error,
    refresh,
    defaultCurrency,
    paymentTimeline,
    riskProfile,
    amountDisplay,
    dueDateDisplay,
    dueRelative,
  } = useBillDetails(id, api);

  const buildAiPrompt = useCallback(
    (record, followUp, angle) =>
      buildBillPrompt({
        bill: record,
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
    entity: bill,
    buildPrompt: buildAiPrompt,
    api,
    entityType: "bill",
    pickAngle: pickBillAngle,
  });

  const goBack = useCallback(() => navigate("/bills"), [navigate]);

  const summaryAvailable = Boolean(aiState.summary);

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
          <ErrorMessage error={error} onRetry={refresh} />
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
                    onClick={() => refreshBriefing()}
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
                    {analysisAngle && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-amber-500/20 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-amber-50">
                        <span>Lens</span>
                        <span className="rounded-full bg-black/30 px-2 py-0.5 text-amber-100">
                          {analysisAngle.label}
                        </span>
                      </div>
                    )}
                    {analysisAngle?.tagline && (
                      <p className="mt-1 text-[0.7rem] uppercase tracking-wide text-amber-200/60">
                        {analysisAngle.tagline}
                      </p>
                    )}
                    <div className="mt-4 space-y-4">
                      {aiLoading ? (
                        <div className="flex items-center gap-3 text-sm text-amber-100">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" />
                          <span>Generating the latest briefing…</span>
                        </div>
                      ) : aiError ? (
                        <div className="text-sm text-rose-200">{aiError}</div>
                      ) : summaryAvailable ? (
                        <div className="space-y-3">
                          {displayedLines
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
                          {isTyping && (
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
