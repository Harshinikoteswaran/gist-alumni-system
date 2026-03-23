import { useEffect, useState } from "react";
import API from "../services/api";
import { formatDateDMY } from "../utils/dateFormat";

const initialForm = {
  title: "",
  company: "",
  location: "",
  jobType: "Full-time",
  description: "",
  applyLink: "",
  deadline: "",
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const fetchJobs = async () => {
    try {
      const { data } = await API.get("/jobs");
      setJobs(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load jobs");
    }
  };

  useEffect(() => {
    fetchJobs();
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
        await API.put(`/jobs/${editingId}`, form);
      } else {
        await API.post("/jobs", form);
      }
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error(error);
      alert("Operation failed");
    }
  };

  const handleEdit = (job) => {
    setEditingId(job._id);
    setForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      jobType: job.jobType || "Full-time",
      description: job.description || "",
      applyLink: job.applyLink || "",
      deadline: job.deadline ? job.deadline.slice(0, 10) : "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await API.delete(`/jobs/${id}`);
      fetchJobs();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Manage Jobs</h2>

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-4">{editingId ? "Edit Job" : "Add Job"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="title" placeholder="Job title" value={form.title} onChange={handleChange} required className="border p-2 rounded" />
          <input name="company" placeholder="Company" value={form.company} onChange={handleChange} required className="border p-2 rounded" />
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="border p-2 rounded" />
          <select name="jobType" value={form.jobType} onChange={handleChange} className="border p-2 rounded">
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Internship</option>
            <option>Contract</option>
          </select>
          <input name="applyLink" placeholder="Apply link" value={form.applyLink} onChange={handleChange} className="border p-2 rounded" />
          <input name="deadline" type="date" value={form.deadline} onChange={handleChange} className="border p-2 rounded" />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} className="border p-2 rounded md:col-span-2" />
        </div>
        <div className="flex gap-3 mt-4">
          <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
            {editingId ? "Update Job" : "Add Job"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-200 px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4">All Jobs</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Title</th>
              <th className="py-2">Company</th>
              <th className="py-2">Type</th>
              <th className="py-2">Deadline</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job._id} className="border-b">
                <td className="py-2">{job.title}</td>
                <td className="py-2">{job.company}</td>
                <td className="py-2">{job.jobType}</td>
                <td className="py-2">{job.deadline ? formatDateDMY(job.deadline) : "-"}</td>
                <td className="py-2 flex flex-wrap gap-2">
                  <button onClick={() => handleEdit(job)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit</button>
                  <button onClick={() => handleDelete(job._id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
