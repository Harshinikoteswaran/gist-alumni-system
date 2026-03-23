import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      if (res.data.role !== "admin") {
        alert("Access denied. Admin account required");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      alert("Admin login successful");
      navigate("/admin-dashboard");
    } catch (error) {
      try {
        const legacyRes = await API.post("/admin/login", { email, password });
        localStorage.setItem("token", legacyRes.data.token);
        localStorage.setItem("role", "admin");
        alert("Admin login successful");
        navigate("/admin-dashboard");
      } catch (legacyError) {
        alert("Invalid credentials");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Admin Email"
            className="border p-3 w-full mb-4 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-3 w-full mb-4 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-orange-600 text-white py-3 rounded hover:bg-orange-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
