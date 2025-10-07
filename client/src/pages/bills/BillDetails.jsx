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
    <div className="bg-gradient-to-b from-[#0A0A0A] via-[#0E111A] to-[#1A1D2A] min-h-screen text-white">
      <Navigation />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            className="px-4 py-2 rounded-lg border border-gray-600/40 text-gray-200 bg-white/5 hover:text-amber-300 hover:border-amber-400/40
 backdrop-blur-sm transition-all mb-6"
          >
            ← Back to bills
          </button>
          <div className="flex w-full flex-col items-start gap-3 text-left sm:w-auto">
            <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
              Bill overview
            </p>
            <h1 className="text-3xl font-bold text-white">{bill.name}</h1>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-2xl font-semibold text-amber-300">
                {amountDisplay}
              </span>
              <StatusBadge
                className="text-sm font-medium px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/30"
                status={bill.status}
              />
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
                  <p
                    className="AI payment command
  text-xs font-semibold uppercase tracking-wide text-amber-200/90
"
                  >
                    AI payment command
                  </p>
                  <h2 className="text-4xl font-bold text-white tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">
                    Intelligent bill briefing
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-amber-100/80">
                    Renewly’s co-pilot fuses due timing, payment habits, and
                    budget health into a live dossier so you can stay ahead of
                    late fees and cash flow surprises.
                  </p>
                </div>
                <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto lg:items-start">
                  <div className="p-6 bg-gradient-to-br from-[#1A1423]/80 via-[#0C0F18]/80 to-[#111827]/80 border border-amber-400/20 rounded-2xl backdrop-blur-md shadow-lg">
                    <p className="text-sm uppercase tracking-widest text-amber-400/80 font-semibold mb-1">
                      Amount due
                    </p>
                    <p className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]">
                      {amountDisplay}
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      {dueDateDisplay}
                      {dueRelative ? ` · ${dueRelative}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => refreshBriefing()}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-400 text-black font-semibold shadow-lg hover:from-amber-400 hover:to-yellow-400 transition-all"
                  >
                    Refresh briefing
                  </button>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-inner backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.25em] text-emerald-400/80 font-semibold flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                      </span>
                    </p>
                    <p className="text-amber-400/80 text-sm mt-1 flex items-center gap-2">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/70 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
                      </span>
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
                      <p className="text-gray-200 text-sm font-medium italic mt-3 pl-4 border-l-2 border-amber-400/40">
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
                        <h3 className="text-xs uppercase tracking-[0.25em] text-amber-400/90 font-semibold">
                          Payment timeline
                        </h3>
                        <p className="text-sm text-gray-400 uppercase tracking-widest mt-1">
                          {bill.paymentMethod || "Payment method pending"}
                        </p>
                      </div>
                      <span className="text-gray-200 font-medium">
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
                                <p className="text-sm text-amber-200/80">
                                  {item.secondary}
                                </p>
                              )}
                            </div>
                            <p className="text-amber-400 font-semibold mt-1">
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
                          <p className="text-xs uppercase tracking-[0.25em] text-amber-400/90 font-semibold flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/70 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                            </span>
                            Risk radar
                          </p>
                          <p className="text-amber-400 font-semibold text-lg">
                            {riskProfile.level}
                          </p>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {riskProfile.narrative}
                          </p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-2 text-xs text-amber-100/80">
                        {riskProfile.signals.map((signal, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-300" />
                            <div>
                              <p className="text-xs uppercase tracking-widest text-gray-400">
                                {signal.label}
                              </p>
                              <p className="text-gray-200 font-medium">
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
