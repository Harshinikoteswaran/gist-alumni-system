import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login({ onClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.removeItem("firstLoginPending");

      if (onClose) onClose();

      if (res.data.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      const code = error?.response?.data?.code;
      const message = error?.response?.data?.message || "Login failed. Please try again.";
      if (code === "FIRST_TIME_LOGIN") {
        if (onClose) onClose();
        navigate(`/set-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        return;
      }
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-600 text-white py-2.5 rounded-lg hover:bg-orange-700 disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            navigate(`/forgot-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
          }}
          className="w-full text-sm text-blue-600 hover:underline"
        >
          Forgot password or first-time login?
        </button>
      </form>
    </div>
  );
}

export default Login;
