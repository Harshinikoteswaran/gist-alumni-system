import { useEffect, useMemo, useState } from "react";
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

export default function AlumniJobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  const fetchJobs = async () => {
    try {
      const { data } = await API.get("/jobs");
      setJobs(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/jobs", form);
      setForm(initialForm);
      fetchJobs();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const canManageJob = (job) => {
    if (!token) return false;
    if (userRole === "admin") return true;
    const myId = parseJwtId(token);
    return myId && job.postedBy?._id === myId;
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job post?")) return;
    try {
      await API.delete(`/jobs/${jobId}`);
      fetchJobs();
    } catch (error) {
      alert("Delete failed");
    }
  };

  const sortedJobs = useMemo(() => jobs, [jobs]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Jobs</h2>

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Post a Job</h3>
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
        <button disabled={loading} className="mt-4 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-60">
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedJobs.map((job) => (
          <article key={job._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xl font-semibold text-[#253B7B]">{job.title}</h3>
            <p className="text-gray-700 mt-1">{job.company} | {job.location || "Location not specified"}</p>
            <p className="text-sm text-gray-500 mt-1">
              {job.jobType}
              {job.deadline ? ` | Deadline: ${formatDateDMY(job.deadline)}` : ""}
            </p>
            <p className="mt-3 text-gray-700">{job.description || "No description"}</p>
            <p className="text-sm text-gray-500 mt-3">
              Posted by: {job.postedBy?.name || "Alumni"} ({job.postedByRole || "alumni"})
            </p>
            <div className="mt-4 flex gap-2">
              {job.applyLink && (
                <a href={job.applyLink} target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm">
                  Apply
                </a>
              )}
              {canManageJob(job) && (
                <button onClick={() => handleDelete(job._id)} className="bg-red-600 text-white px-3 py-1.5 rounded text-sm">
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function parseJwtId(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  } catch {
    return null;
  }
}
