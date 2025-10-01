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
      <div className="space-y-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">
        <p className="font-semibold">Unable to load insights</p>
        <p>{error}</p>
        <button
          onClick={loadInsights}
          className="rounded-lg bg-red-500/30 px-3 py-2 text-xs text-red-100 transition hover:bg-red-500/40"
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
        <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
              <span className="text-lg">⚠️</span>
            </div>
            <div>
              <h3 className="font-semibold text-orange-300">Smart alerts</h3>
              <p className="text-sm text-orange-200/80">
                Proactive notifications about your finances
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {insights.alerts.map((alert, index) => (
              <div
                key={`${alert.title}-${index}`}
                className="flex items-center justify-between rounded-xl border border-orange-500/20 bg-orange-500/5 p-3"
              >
                <div>
                  <h4 className="text-sm font-medium text-orange-200">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-orange-200/70">{alert.message}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs uppercase ${
                    alert.severity === "high"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-orange-500/20 text-orange-400"
                  }`}
                >
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {insights.tips?.length ? (
        <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
              <span className="text-lg">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-green-300">
                Personalized tips
              </h3>
              <p className="text-sm text-green-200/80">
                Recommendations tailored for you
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {insights.tips.map((tip, index) => (
              <div
                key={`${tip}-${index}`}
                className="rounded-xl border border-green-500/10 bg-green-500/5 p-3 text-sm text-green-100"
              >
                {tip}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {insights.persona ? (
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
              <span className="text-lg">🎭</span>
            </div>
            <div>
              <h3 className="font-semibold text-purple-300">
                Your financial style
              </h3>
              <p className="text-sm text-purple-200/80">
                Understanding how you manage money
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm text-purple-100">
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
            <div className="space-y-2 text-sm text-purple-100">
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
