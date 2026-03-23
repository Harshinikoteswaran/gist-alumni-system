import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
  rollNumber: "",
  batch: "",
  degree: "",
  department: "Computer Science and Engineering",
  company: "",
  position: "",
  location: "",
  bio: "",
};

export default function AdminAlumni() {
  const [alumni, setAlumni] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const inferBatchYear = (rollNumber, fallbackBatch) => {
    const roll = String(rollNumber || "").trim();
    const rollMatch = roll.match(/^(\d{2})/);
    if (rollMatch) {
      return `20${rollMatch[1]}`;
    }

    const text = String(fallbackBatch || "").trim();
    if (!text) return "";
    const batchMatch = text.match(/\b(19|20)\d{2}\b/);
    return batchMatch ? batchMatch[0] : text;
  };

  const fetchAlumni = async () => {
    try {
      const { data } = await API.get("/alumni/admin/list");
      setAlumni(data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch alumni");
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const batches = useMemo(() => {
    const uniq = [...new Set(alumni.map((item) => inferBatchYear(item.rollNumber, item.batch)).filter(Boolean))];
    return uniq.sort((a, b) => Number(a) - Number(b));
  }, [alumni]);

  const filteredAlumni = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alumni.filter((item) => {
      const name = item.user?.name?.toLowerCase() || "";
      const roll = item.rollNumber?.toLowerCase() || "";
      const matchesSearch = !q || name.includes(q) || roll.includes(q);
      const matchesBatch = batchFilter === "all" || inferBatchYear(item.rollNumber, item.batch) === batchFilter;
      return matchesSearch && matchesBatch;
    });
  }, [alumni, search, batchFilter]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await API.put(`/alumni/${editingId}`, {
          name: form.name,
          email: form.email,
          rollNumber: form.rollNumber,
          batch: form.batch,
          degree: form.degree,
          department: form.department,
          company: form.company,
          position: form.position,
          location: form.location,
          bio: form.bio,
        });
      } else {
        await API.post("/alumni/admin/create", form);
      }
      resetForm();
      fetchAlumni();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.user?.name || "",
      email: item.user?.email || "",
      password: "",
      rollNumber: item.rollNumber || "",
      batch: item.batch || "",
      degree: item.degree || "",
      department: item.department || "Computer Science and Engineering",
      company: item.company || "",
      position: item.position || "",
      location: item.location || "",
      bio: item.bio || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleApproval = async (item) => {
    try {
      await API.patch(`/alumni/${item._id}/approve`, { isApproved: !item.isApproved });
      fetchAlumni();
    } catch (error) {
      console.error(error);
      alert("Failed to update approval");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this alumni record?")) return;
    try {
      await API.delete(`/alumni/${id}`);
      fetchAlumni();
      if (editingId === id) resetForm();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  const handleBulkImport = async () => {
    if (!bulkFile) {
      alert("Please select an excel file");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("file", bulkFile);

      const { data } = await API.post("/alumni/admin/bulk-import", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(
        `Import complete. Created users: ${data.created}, Updated profiles: ${data.updated || 0}, Skipped: ${data.skipped}, Total rows: ${data.totalRows}. Imported users must set password at first login.`,
      );
      setBulkFile(null);
      fetchAlumni();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Bulk import failed");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Alumni Directory Management</h2>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-4">Bulk Import Alumni (Excel)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="file"
            accept=".xlsx,.xls,.csv,.ods"
            onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
            className="border p-2 rounded"
          />
          <button onClick={handleBulkImport} className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
            Import File
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Imported alumni log in with email. If password is not set, they are redirected to set it first.
        </p>
      </div>

      <form onSubmit={handleCreateOrUpdate} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-4">{editingId ? "Edit Alumni" : "Add Alumni"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required className="border p-2 rounded" />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="border p-2 rounded" />
          {!editingId && <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="border p-2 rounded" />}
          <input name="rollNumber" placeholder="Roll number" value={form.rollNumber} onChange={handleChange} className="border p-2 rounded" />
          <input name="batch" placeholder="Batch year" value={form.batch} onChange={handleChange} className="border p-2 rounded" />
          <input name="degree" placeholder="Degree" value={form.degree} onChange={handleChange} className="border p-2 rounded" />
          <input name="department" placeholder="Department" value={form.department} onChange={handleChange} className="border p-2 rounded" />
          <input name="company" placeholder="Company" value={form.company} onChange={handleChange} className="border p-2 rounded" />
          <input name="position" placeholder="Position" value={form.position} onChange={handleChange} className="border p-2 rounded" />
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="border p-2 rounded" />
          <textarea name="bio" placeholder="Bio" value={form.bio} onChange={handleChange} className="border p-2 rounded md:col-span-2" rows={3} />
        </div>
        <div className="flex gap-3 mt-4">
          <button disabled={loading} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
            {loading ? "Saving..." : editingId ? "Update Alumni" : "Add Alumni"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-200 px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or roll number"
            className="border p-2 rounded md:w-80"
          />
          <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} className="border p-2 rounded md:w-52">
            <option value="all">All Batches</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAlumni.map((item) => (
            <div key={item._id} className="border rounded-xl p-4 bg-gray-50">
              <button className="w-full text-left" onClick={() => setSelected(item)}>
                {item.profilePicture ? (
                  <img src={item.profilePicture} alt={item.user?.name} className="w-16 h-16 rounded-full object-cover mb-3" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-300 text-white flex items-center justify-center mb-3 text-xl font-bold">
                    {item.user?.name?.[0] || "A"}
                  </div>
                )}
                <h4 className="text-lg font-semibold">{item.user?.name || "Unnamed"}</h4>
                <p className="text-sm text-gray-600">Roll No: {item.rollNumber || "-"}</p>
                <p className="text-sm text-gray-600">Batch: {item.batch || "-"}</p>
                <p className="text-sm text-gray-600">Department: {item.department || "-"}</p>
                <p className="text-sm text-gray-600">Company: {item.company || "-"}</p>
                <p className="text-sm text-gray-600">Location: {item.location || "-"}</p>
                <p className="text-xs mt-1">
                  <span className={`px-2 py-1 rounded ${item.user?.isFirstLogin ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {item.user?.isFirstLogin ? "New Alumni" : "Active Alumni"}
                  </span>
                </p>
              </button>
              <div className="flex flex-wrap gap-2 mt-3">
                <button onClick={() => startEdit(item)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit</button>
                <button onClick={() => toggleApproval(item)} className="bg-emerald-600 text-white px-3 py-1 rounded text-sm">
                  {item.isApproved ? "Unapprove" : "Approve"}
                </button>
                <button onClick={() => handleDelete(item._id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white max-w-2xl w-full rounded-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold">{selected.user?.name}</h3>
            <p className="text-gray-600 mt-1">{selected.user?.email}</p>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <p><span className="font-semibold">Roll Number:</span> {selected.rollNumber || "-"}</p>
              <p><span className="font-semibold">Batch:</span> {selected.batch || "-"}</p>
              <p><span className="font-semibold">Degree:</span> {selected.degree || "-"}</p>
              <p><span className="font-semibold">Department:</span> {selected.department || "-"}</p>
              <p><span className="font-semibold">Company:</span> {selected.company || "-"}</p>
              <p><span className="font-semibold">Position:</span> {selected.position || "-"}</p>
              <p><span className="font-semibold">Location:</span> {selected.location || "-"}</p>
              <p><span className="font-semibold">Status:</span> {selected.isApproved ? "Approved" : "Pending"}</p>
              <p><span className="font-semibold">Password:</span> {selected.user?.isFirstLogin ? "Initial fixed password" : "Changed by alumni"}</p>
            </div>
            <p className="mt-4 text-gray-700 whitespace-pre-wrap">{selected.bio || "No bio available."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
