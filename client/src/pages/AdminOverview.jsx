import { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalAlumni: 0,
    approvedAlumni: 0,
    pendingAlumni: 0,
    galleryImages: 0,
    events: 0,
    jobs: 0,
    newsletters: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [alumniRes, pendingUsersRes, galleryRes, eventsRes, jobsRes, newslettersRes] = await Promise.all([
          API.get("/alumni/admin/list"),
          API.get("/admin/pending-users"),
          API.get("/gallery"),
          API.get("/events"),
          API.get("/jobs"),
          API.get("/newsletters"),
        ]);

        const alumni = alumniRes.data || [];
        const pendingAlumni = pendingUsersRes.data?.length || 0;
        const approvedAlumni = Math.max(alumni.length - pendingAlumni, 0);

        setStats({
          totalAlumni: alumni.length,
          approvedAlumni,
          pendingAlumni,
          galleryImages: galleryRes.data?.length || 0,
          events: eventsRes.data?.length || 0,
          jobs: jobsRes.data?.length || 0,
          newsletters: newslettersRes.data?.length || 0,
        });
      } catch (error) {
        console.error("Failed to fetch admin overview stats", error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { label: "Total Alumni", value: stats.totalAlumni },
    { label: "Approved Alumni", value: stats.approvedAlumni },
    { label: "Pending Users", value: stats.pendingAlumni },
    { label: "Gallery Images", value: stats.galleryImages },
    { label: "Events", value: stats.events },
    { label: "Jobs", value: stats.jobs },
    { label: "Newsletters", value: stats.newsletters },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-3xl font-bold text-[#253B7B] mt-2">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
