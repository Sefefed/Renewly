import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import phonePreview from "../../assets/phone-preview.png";

export default function LandingPage() {
  const [isWaiting, setIsWaiting] = useState(false);
  const navigate = useNavigate();
  const pendingTimeout = useRef(null);

  useEffect(() => {
    return () => {
      if (pendingTimeout.current) {
        clearTimeout(pendingTimeout.current);
      }
    };
  }, []);

  const handleGetStarted = () => {
    if (isWaiting) return;
    setIsWaiting(true);
    pendingTimeout.current = setTimeout(() => {
      navigate("/signup");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden text-white">
      <img
        src={phonePreview}
        alt="Renewly preview"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
      <div
        className="hero-gradient absolute -left-[20%] top-[-25%] h-[60vw] w-[60vw] max-h-[520px] max-w-[520px]"
        aria-hidden="true"
      />
      <div
        className="hero-gradient hero-gradient--delayed absolute bottom-[-35%] right-[-10%] h-[65vw] w-[65vw] max-h-[560px] max-w-[560px]"
        aria-hidden="true"
      />

      <div className="hero-content relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between p-6">
          <h1 className="text-xl font-bold">Renewly</h1>
        </header>

        <main className="flex flex-grow flex-col items-center justify-center gap-6 px-4 text-center">
          <h2 className="hero-title text-3xl font-bold leading-tight md:text-5xl">
            TRACK YOUR <br /> FINANCES SMARTLY
          </h2>
          <button
            type="button"
            onClick={handleGetStarted}
            disabled={isWaiting}
            aria-live="polite"
            className={`hero-cta relative inline-flex items-center justify-center gap-3 rounded-md border border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              isWaiting
                ? "cursor-not-allowed opacity-90"
                : "hover:from-gray-700 hover:to-gray-800 hover:scale-105 hover:shadow-lg"
            }`}
          >
            {isWaiting ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin text-slate-200"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  role="presentation"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-30"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span>Preparing…</span>
              </>
            ) : (
              "Get Started"
            )}
          </button>
        </main>
      </div>
    </div>
  );
}
