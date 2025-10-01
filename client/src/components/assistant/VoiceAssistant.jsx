import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const getSpeechRecognition = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition ||
    null
  );
};

const VoiceAssistant = ({ onTranscript, theme = "dark" }) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef(null);
  const capturedTranscriptRef = useRef("");
  const isDark = theme === "dark";

  const Recognition = useMemo(() => getSpeechRecognition(), []);

  useEffect(() => {
    if (!Recognition) {
      return undefined;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const results = Array.from(event.results ?? []);
      const interimTranscript = results
        .map((result) => result[0]?.transcript ?? "")
        .join("");

      const finalSegments = results
        .filter((result) => result.isFinal)
        .map((result) => result[0]?.transcript ?? "");

      if (interimTranscript) {
        setInterimText(interimTranscript);
      }

      if (finalSegments.length) {
        capturedTranscriptRef.current = finalSegments.join(" ");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      const transcript = capturedTranscriptRef.current.trim();

      if (transcript) {
        onTranscript?.(transcript);
      }

      capturedTranscriptRef.current = "";
      setInterimText("");
    };

    recognition.onerror = () => {
      setIsListening(false);
      capturedTranscriptRef.current = "";
      setInterimText("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [Recognition, onTranscript]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }

    try {
      recognition.stop();
    } catch (error) {
      console.warn("Voice recognition stop failed", error);
    }
  }, []);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || isListening) {
      return;
    }

    try {
      capturedTranscriptRef.current = "";
      setInterimText("");
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.warn("Voice recognition start failed", error);
      setIsListening(false);
    }
  }, [isListening]);

  const handleClick = useCallback(() => {
    if (!Recognition) {
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [Recognition, isListening, startListening, stopListening]);

  if (!Recognition) {
    return null;
  }

  const baseClasses = isDark
    ? "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700";

  const activeClasses = isDark
    ? "bg-red-500/20 text-red-400"
    : "bg-red-100 text-red-600";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-xl p-3 transition-all duration-300 ${
        isListening ? `${activeClasses} animate-pulse` : baseClasses
      }`}
      aria-pressed={isListening}
      aria-label={isListening ? "Stop voice capture" : "Start voice capture"}
      title={
        isListening
          ? "Listening... click to stop"
          : "Click to speak to the assistant"
      }
    >
      <span className="text-xl">{isListening ? "🎤" : "🎙️"}</span>
      {interimText ? (
        <span className="ml-2 max-w-[9rem] truncate text-xs opacity-70">
          {interimText}
        </span>
      ) : null}
    </button>
  );
};

export default VoiceAssistant;
