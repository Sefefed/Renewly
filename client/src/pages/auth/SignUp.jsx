import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import DelayedLink from "../../components/ui/DelayedLink";
import { parseApiError, toErrorState } from "../../utils/errorHandling";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function SignUp() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const DELAY_MS = 400;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        const parsed = parseApiError(
          res.status,
          data,
          "Unable to create your account right now. Please try again shortly."
        );
        const err = new Error(parsed.message);
        err.status = parsed.status;
        err.details = parsed.details;
        throw err;
      }

      // Save token + user to localStorage
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      login(data.data); // Update AuthContext
      setTimeout(() => navigate("/dashboard"), DELAY_MS);
    } catch (err) {
      setError(
        toErrorState(
          err,
          "Something went wrong while creating your account. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-blue-900 p-4 text-white text-center font-bold text-xl">
        Personal Finance Copilot
      </div>

      <div className="flex flex-1 justify-center items-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg text-gray-900"
        >
          <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

          {error && (
            <div className="bg-white-500/20 border border-red-50 rounded-lg p-3 mb-4 space-y-1">
              <p className="text-red-500 text-sm font-medium">
                {error.message}
              </p>
              {error.details?.length > 0 && (
                <ul className="list-disc list-inside text-xs text-red-200/80">
                  {error.details.map((detail, index) => (
                    <li key={`${detail}-${index}`}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-4 focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-4 focus:outline-none focus:ring focus:ring-blue-200"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-6 focus:outline-none focus:ring focus:ring-blue-200"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded font-semibold hover:bg-blue-800 transition"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {/* Footer links */}
          <div className="text-center text-sm text-gray-600 mt-4">
            <span>Already have an account? </span>
            <DelayedLink
              to="/signin"
              delay={DELAY_MS}
              className="text-blue-600 hover:underline"
            >
              Login
            </DelayedLink>
          </div>
        </form>
      </div>
    </div>
  );
}
