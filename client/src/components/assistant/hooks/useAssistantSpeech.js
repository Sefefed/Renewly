import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "renewly-assistant-speech";

const getSynthesis = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.speechSynthesis ?? null;
};

const useAssistantSpeech = () => {
  const synthesis = useMemo(() => getSynthesis(), []);
  const utteranceRef = useRef(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!synthesis) {
      setIsSupported(false);
      return undefined;
    }

    setIsSupported(true);

    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage?.getItem(STORAGE_KEY);
        setIsEnabled(stored === null ? true : stored === "true");
      } catch {
        setIsEnabled(true);
      }
    } else {
      setIsEnabled(true);
    }

    return () => {
      synthesis.cancel();
      utteranceRef.current = null;
      setIsSpeaking(false);
    };
  }, [synthesis]);

  const stop = useCallback(() => {
    if (!synthesis) {
      return;
    }

    synthesis.cancel();
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, [synthesis]);

  const speak = useCallback(
    (text) => {
      if (!synthesis || !isSupported || !isEnabled) {
        return;
      }

      const content = typeof text === "string" ? text.trim() : "";
      if (!content) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      synthesis.cancel();
      synthesis.speak(utterance);
      utteranceRef.current = utterance;
    },
    [isEnabled, isSupported, synthesis]
  );

  const toggleSpeech = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          window.localStorage?.setItem(STORAGE_KEY, String(next));
        } catch {
          /* ignore persistence errors */
        }
      }
      if (!next) {
        stop();
      }
      return next;
    });
  }, [stop]);

  return {
    isSupported,
    isEnabled: isSupported && isEnabled,
    isSpeaking,
    speak,
    stop,
    toggleSpeech,
  };
};

export default useAssistantSpeech;
