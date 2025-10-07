import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../utils/api";
import AssistantResponse from "./components/AssistantResponse";
import RecommendationSummaryCard from "./components/RecommendationSummaryCard";
import RecommendedStepsCard from "./components/RecommendedStepsCard";
import useRecommendationInsight from "./hooks/useRecommendationInsight";

const RecommendationInsightPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { recommendation, prompt } = location.state ?? {};

  const { token } = useAuth();
  const api = useApi(token);

  const { assistantActions, error, isLoading, responseText } =
    useRecommendationInsight({
      api,
      recommendation,
      prompt,
    });

  useEffect(() => {
    if (!recommendation || !prompt) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, prompt, recommendation]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto w-full max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-800"
        >
          <span aria-hidden>←</span>
          Back to dashboard
        </button>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="space-y-4">
            <RecommendationSummaryCard recommendation={recommendation} />
            <RecommendedStepsCard actions={assistantActions} />
          </div>

          <AssistantResponse
            title={
              recommendation?.title
                ? `What to do about ${recommendation.title}`
                : "Recommendation guidance"
            }
            responseText={responseText}
            isLoading={isLoading}
            error={error}
            emptyMessage="The assistant didn’t return guidance for this recommendation. Try again later or ask the assistant from the dashboard."
          />
        </div>
      </div>
    </div>
  );
};

export default RecommendationInsightPage;
