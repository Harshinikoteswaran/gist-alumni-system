import { useEffect, useState } from "react";
import API from "../services/api";

function Register({ onClose, onRegistered }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    rollNumber: "",
    batch: "",
    department: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const roll = String(form.rollNumber || "").trim().toUpperCase();
    const match = roll.match(/^(\d{2})/);
    const autoBatch = match ? `20${match[1]}` : "";
    setForm((prev) => (prev.batch === autoBatch ? prev : { ...prev, batch: autoBatch }));
  }, [form.rollNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", form);
      alert(data?.message || "Registration successful.");
      if (onRegistered) onRegistered();
      else if (onClose) onClose();
    } catch (error) {
      alert(error?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          name="rollNumber"
          placeholder="Roll Number (e.g. 222U1A0501)"
          value={form.rollNumber}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          name="batch"
          placeholder="Batch"
          value={form.batch}
          readOnly
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
        />
        <input
          name="department"
          placeholder="Department"
          value={form.department}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        <button
          disabled={loading}
          className="w-full bg-orange-600 text-white py-2.5 rounded-lg hover:bg-orange-700 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

export default Register;
