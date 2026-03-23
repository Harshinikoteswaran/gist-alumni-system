import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: "/admin-dashboard", label: "Overview" },
    { to: "/admin-dashboard/alumni", label: "Manage Alumni" },
    { to: "/admin-dashboard/pending-users", label: "Pending Users" },
    { to: "/admin-dashboard/gallery", label: "Manage Gallery" },
    { to: "/admin-dashboard/events", label: "Manage Events" },
    { to: "/admin-dashboard/jobs", label: "Manage Jobs" },
    { to: "/admin-dashboard/newsletters", label: "Manage Newsroom" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-72 bg-white border-r border-gray-200 p-6 hidden md:block">
        <h1 className="text-2xl font-bold text-[#253B7B] mb-6">Admin Panel</h1>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-2 rounded-md ${
                location.pathname === link.to
                  ? "bg-orange-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-8 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <div className="md:hidden bg-white rounded-lg shadow-sm p-4 mb-4">
          <h1 className="text-xl font-bold text-[#253B7B]">Admin Panel</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1 rounded-md text-sm ${
                  location.pathname === link.to
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-md text-sm bg-red-600 text-white"
            >
              Logout
            </button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
