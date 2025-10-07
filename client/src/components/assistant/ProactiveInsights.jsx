import { useEffect, useState } from "react";
import InsightsSkeleton from "./InsightsSkeleton";

const ProactiveInsights = ({ api, onInsightsLoaded }) => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getAssistantInsights();
      setInsights(response.data);
      onInsightsLoaded?.(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
    const interval = setInterval(loadInsights, 60 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <InsightsSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600 shadow-sm">
        <p className="font-semibold">Unable to load insights</p>
        <p>{error}</p>
        <button
          onClick={loadInsights}
          className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="space-y-6">
      {insights.alerts?.length ? (
        <section
          className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm"
          aria-label="Predictive alerts"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-white">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <h3 className="assistant-alerts__heading">Smart alerts</h3>
              <p className="assistant-alerts__subtitle">
                Proactive notifications about your finances
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {insights.alerts.map((alert, index) => (
              <div
                key={`${alert.title}-${index}`}
                className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-3 shadow-sm"
              >
                <div>
                  <h4 className="assistant-alerts__item-title">
                    {alert.title}
                  </h4>
                  <p className="assistant-alerts__item-message">
                    {alert.message}
                  </p>
                </div>
                <span
                  className={`assistant-alerts__badge rounded-full border px-2 py-1 uppercase ${
                    alert.severity === "high"
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-amber-200 bg-amber-50 text-amber-600"
                  }`}
                >
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {insights.tips?.length ? (
        <section
          id="personalized-tips"
          className="rounded-2xl border border-gray-300 bg-white p-6 shadow-sm scroll-mt-28"
          aria-label="Personalized tips"
        >
          <div className="mb-4 flex items-center gap-3">
            <div>
              <h3 className="font-semibold text-black">Personalized tips</h3>
              <p className="text-sm text-black">
                Recommendations tailored for you
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {insights.tips.map((tip, index) => (
              <div
                key={`${tip}-${index}`}
                className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-blue-600 shadow-sm text-bold"
              >
                {tip}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {insights.persona ? (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200 bg-white">
              <span className="text-lg">🎭</span>
            </div>
            <div>
              <h3 className="font-semibold text-violet-700">
                Your financial style
              </h3>
              <p className="text-sm text-violet-600/80">
                Understanding how you manage money
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm text-violet-700">
              <div className="flex justify-between">
                <span>Spending style</span>
                <span className="font-medium capitalize">
                  {insights.persona.spendingStyle.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Risk tolerance</span>
                <span className="font-medium capitalize">
                  {insights.persona.riskTolerance}
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-violet-700">
              <div className="flex justify-between">
                <span>Learning priority</span>
                <span className="font-medium capitalize">
                  {insights.persona.learningPriority.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Communication</span>
                <span className="font-medium capitalize">
                  {insights.persona.preferredCommunication}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProactiveInsights;
