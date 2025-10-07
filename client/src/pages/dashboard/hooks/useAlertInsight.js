import { useEffect, useState } from "react";

const MISSING_DETAILS_MESSAGE =
  "We couldn’t find the predictive alert details. Head back to the dashboard and try again.";

const useAlertInsight = ({ api, alert, prompt }) => {
  const [assistantResponse, setAssistantResponse] = useState(null);
  const [assistantActions, setAssistantActions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!alert || !prompt) {
      setAssistantResponse(null);
      setAssistantActions([]);
      setIsLoading(false);
      setError(MISSING_DETAILS_MESSAGE);
      return undefined;
    }

    let isMounted = true;

    const fetchInsight = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.assistantQuery(prompt, {
          alert,
          source: "alert_insight",
        });

        if (!isMounted) return;

        setAssistantResponse(response?.data?.response ?? null);
        setAssistantActions(response?.data?.actions ?? []);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err?.message ||
            "The assistant couldn’t generate guidance right now. Please try again in a moment."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInsight();

    return () => {
      isMounted = false;
    };
  }, [alert, api, prompt]);

  return {
    assistantActions,
    isLoading,
    error,
    responseText: assistantResponse?.text ?? "",
  };
};

export default useAlertInsight;
