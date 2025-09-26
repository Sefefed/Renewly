import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function SignIn() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save token + user to localStorage
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      login(data.data); // Update AuthContext
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
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

      {/* Center Card */}
      <div className="flex flex-1 justify-center items-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg text-gray-900"
        >
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

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
            {loading ? "Signing in..." : "Login"}
          </button>

          {/* Footer links */}
          <div className="text-center text-sm text-gray-600 mt-4">
            <Link to="/privacy" className="text-blue-600 hover:underline mr-3">
              Privacy Policy
            </Link>
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot password
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
