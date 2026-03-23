import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { formatDateDMY } from "../utils/dateFormat";

const initialForm = {
  title: "",
  summary: "",
  content: "",
  publishedAt: "",
};

export default function AdminNewsletters() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const titleInputRef = useRef(null);

  const fetchItems = async () => {
    try {
      const { data } = await API.get("/newsletters");
      setItems(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load newsletters");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setCoverImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (coverImageFile) {
        payload.append("coverImage", coverImageFile);
      }

      if (editingId) {
        await API.put(`/newsletters/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/newsletters", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      resetForm();
      fetchItems();
    } catch (error) {
      alert(error?.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setCoverImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setForm({
      title: item.title || "",
      summary: item.summary || "",
      content: item.content || "",
      publishedAt: item.publishedAt ? item.publishedAt.slice(0, 10) : "",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 200);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this newsletter?")) return;
    try {
      await API.delete(`/newsletters/${id}`);
      fetchItems();
    } catch (error) {
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Manage Newsletters</h2>

      <form ref={formRef} onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-4">{editingId ? "Edit Newsletter" : "Add Newsletter"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input ref={titleInputRef} name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="border p-2 rounded" />
          <input name="publishedAt" type="date" value={form.publishedAt} onChange={handleChange} className="border p-2 rounded" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
            className="border p-2 rounded md:col-span-2"
          />
          <textarea name="summary" placeholder="Short summary" value={form.summary} onChange={handleChange} rows={2} className="border p-2 rounded md:col-span-2" />
          <textarea name="content" placeholder="Full content" value={form.content} onChange={handleChange} rows={5} required className="border p-2 rounded md:col-span-2" />
        </div>
        <div className="flex gap-3 mt-4">
          <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
            {editingId ? "Update Newsletter" : "Publish Newsletter"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-200 px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            {item.coverImage && (
              <img src={item.coverImage} alt={item.title} className="w-full h-40 object-cover rounded-lg mb-3" />
            )}
            <p className="text-xs text-gray-500">{formatDateDMY(item.publishedAt || item.createdAt)}</p>
            <h3 className="text-lg font-semibold mt-1">{item.title}</h3>
            {item.summary && <p className="text-gray-600 mt-2">{item.summary}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleEdit(item)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit</button>
              <button onClick={() => handleDelete(item._id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
