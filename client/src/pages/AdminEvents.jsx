import { useEffect, useState } from "react";
import API from "../services/api";
import { formatDateDMY } from "../utils/dateFormat";

const initialForm = {
  title: "",
  description: "",
  eventDate: "",
  location: "",
  registrationLink: "",
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const fetchEvents = async () => {
    try {
      const { data } = await API.get("/events");
      setEvents(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/events/${editingId}`, form);
      } else {
        await API.post("/events", form);
      }
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error(error);
      alert("Operation failed");
    }
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setForm({
      title: event.title || "",
      description: event.description || "",
      eventDate: event.eventDate ? event.eventDate.slice(0, 10) : "",
      location: event.location || "",
      registrationLink: event.registrationLink || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await API.delete(`/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Manage Events</h2>

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-4">{editingId ? "Edit Event" : "Add Event"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="title" placeholder="Event title" value={form.title} onChange={handleChange} required className="border p-2 rounded" />
          <input name="eventDate" type="date" value={form.eventDate} onChange={handleChange} required className="border p-2 rounded" />
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="border p-2 rounded" />
          <input name="registrationLink" placeholder="Registration link" value={form.registrationLink} onChange={handleChange} className="border p-2 rounded" />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} className="border p-2 rounded md:col-span-2" />
        </div>
        <div className="flex gap-3 mt-4">
          <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
            {editingId ? "Update Event" : "Add Event"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-200 px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4">All Events</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Title</th>
              <th className="py-2">Date</th>
              <th className="py-2">Location</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id} className="border-b">
                <td className="py-2">{event.title}</td>
                <td className="py-2">{formatDateDMY(event.eventDate)}</td>
                <td className="py-2">{event.location || "-"}</td>
                <td className="py-2 flex flex-wrap gap-2">
                  <button onClick={() => handleEdit(event)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit</button>
                  <button onClick={() => handleDelete(event._id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
