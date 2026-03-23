import React, { useState, useEffect } from "react";
import API from "../services/api";

function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === "login");
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      window.location.href="/dashboard"; // redirect to dashboard
      alert("Login successful");
      onClose(); // close modal
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration successful! Please login.");
      setIsLogin(true); // switch to login tab

      // clear fields
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 sm:w-96 p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Tabs */}
        <div className="flex justify-center mb-4 space-x-4">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-4 py-2 font-semibold border-b-2 ${
              isLogin
                ? "border-orange-500 text-orange-500"
                : "border-transparent"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-2 font-semibold border-b-2 ${
              !isLogin
                ? "border-orange-500 text-orange-500"
                : "border-transparent"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-3 py-2 rounded"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border px-3 py-2 rounded"
              required
            />

            <button
              type="submit"
              className="bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
            >
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border px-3 py-2 rounded"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-3 py-2 rounded"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border px-3 py-2 rounded"
              required
            />

            <button
              type="submit"
              className="bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
            >
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
