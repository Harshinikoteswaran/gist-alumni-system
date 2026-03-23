import { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminPendingUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/pending-users");
      setUsers(data);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const approveUser = async (id) => {
    try {
      await API.patch(`/admin/pending-users/${id}/approve`);
      fetchPendingUsers();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to approve user");
    }
  };

  const rejectUser = async (id) => {
    try {
      await API.delete(`/admin/pending-users/${id}/reject`);
      fetchPendingUsers();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to reject user");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Pending User Registrations</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Batch</th>
              <th className="text-left px-4 py-3">Department</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              users.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">{item.batch || "-"}</td>
                  <td className="px-4 py-3">{item.department || "-"}</td>
                  <td className="px-4 py-3 capitalize">{item.status}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => approveUser(item._id)}
                      className="bg-emerald-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectUser(item._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No pending users.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
