import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [selected, setSelected] = useState(null);
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

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const { data } = await API.get("/alumni");
        setAlumni(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAlumni();
  }, []);

  const batches = useMemo(() => {
    const uniq = [...new Set(alumni.map((item) => inferBatchYear(item.rollNumber, item.batch)).filter(Boolean))];
    return uniq.sort((a, b) => Number(a) - Number(b));
  }, [alumni]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alumni.filter((item) => {
      const name = item.user?.name?.toLowerCase() || "";
      const roll = item.rollNumber?.toLowerCase() || "";
      const searchOk = !q || name.includes(q) || roll.includes(q);
      const batchOk = batchFilter === "all" || inferBatchYear(item.rollNumber, item.batch) === batchFilter;
      return searchOk && batchOk;
    });
  }, [alumni, search, batchFilter]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Alumni Directory</h2>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <button
            key={item._id}
            onClick={() => setSelected(item)}
            className="text-left bg-white border border-gray-100 rounded-xl shadow-sm p-4 hover:shadow-md transition"
          >
            {item.profilePicture ? (
              <img src={item.profilePicture} alt={item.user?.name} className="w-16 h-16 rounded-full object-cover mb-3" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 text-white flex items-center justify-center mb-3 text-xl font-bold">
                {item.user?.name?.[0] || "A"}
              </div>
            )}
            <h3 className="text-lg font-semibold">{item.user?.name}</h3>
            <p className="text-sm text-gray-600">Roll No: {item.rollNumber || "-"}</p>
            <p className="text-sm text-gray-600">Batch: {item.batch || "-"}</p>
            <p className="text-sm text-gray-600">Department: {item.department || "-"}</p>
            <p className="text-sm text-gray-600">Degree: {item.degree || "-"}</p>
            <p className="text-sm text-gray-600">Company: {item.company || "-"}</p>
            <p className="text-sm text-gray-600">Location: {item.location || "-"}</p>
          </button>
        ))}
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
            </div>
            <p className="mt-4 text-gray-700 whitespace-pre-wrap">{selected.bio || "No bio available."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
