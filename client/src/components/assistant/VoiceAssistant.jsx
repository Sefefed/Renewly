import { useCallback, useEffect, useRef, useState } from "react";

const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
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
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const isDark = theme === "dark";

  useEffect(() => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setTranscript(currentTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcript.trim()) {
        onTranscript?.(transcript.trim());
        setTranscript("");
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [onTranscript, transcript]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || isListening) return;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, [isListening]);

  const Recognition = getSpeechRecognition();
  if (!Recognition) {
    return null;
  }

  return (
    <button
      onClick={startListening}
      disabled={isListening}
      className={`rounded-xl p-3 transition-all duration-300 ${
        isListening
          ? isDark
            ? "animate-pulse bg-red-500/20 text-red-400"
            : "animate-pulse bg-red-100 text-red-600"
          : isDark
          ? "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
      }`}
    >
      <span className="text-xl">{isListening ? "🎤" : "🎙️"}</span>
    </button>
  );
};

export default VoiceAssistant;
