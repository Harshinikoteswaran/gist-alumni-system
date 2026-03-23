import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialEmail = useMemo(
    () => (searchParams.get("email") || "").trim().toLowerCase(),
    [searchParams],
  );

  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/auth/set-password", {
        email,
        newPassword,
      });
      alert(data?.message || "Password set successfully. Please login.");
      navigate("/");
    } catch (error) {
      alert(error?.response?.data?.message || "Could not set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-center mb-2">Set Password</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          First time login detected. Set your password to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-2.5 rounded-lg hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Set Password"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

