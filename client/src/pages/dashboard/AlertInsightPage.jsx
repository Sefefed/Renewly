import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useApi } from "../../utils/api";
import AlertSummaryCard from "./components/AlertSummaryCard";
import RecommendedStepsCard from "./components/RecommendedStepsCard";
import AssistantResponse from "./components/AssistantResponse";
import useAlertInsight from "./hooks/useAlertInsight";

const AlertInsightPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { token } = useAuth();
  const api = useApi(token);

  const alert = state?.alert ?? null;
  const prompt = state?.prompt ?? null;

  const { assistantActions, isLoading, error, responseText } = useAlertInsight({
    api,
    alert,
    prompt,
  });

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
            <AlertSummaryCard alert={alert} />
            <RecommendedStepsCard actions={assistantActions} />
          </div>

          <AssistantResponse
            alertTitle={alert?.title ?? ""}
            responseText={responseText}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default AlertInsightPage;
