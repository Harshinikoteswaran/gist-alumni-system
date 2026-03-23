import { Link, useLocation } from "react-router-dom";

function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const linkClass = (path) =>
    `block px-3 py-2 rounded-md transition ${
      location.pathname === path ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div
      className={`
        fixed md:static top-0 left-0 h-full w-72 bg-white shadow-lg p-6 space-y-6 z-50
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      <h2 className="text-xl font-bold text-[#253B7B]">Alumni Panel</h2>

      <nav className="flex flex-col space-y-2">
        <Link to="/dashboard" className={linkClass("/dashboard")} onClick={() => setIsOpen(false)}>
          My Profile
        </Link>
        <Link to="/dashboard/directory" className={linkClass("/dashboard/directory")} onClick={() => setIsOpen(false)}>
          Alumni Directory
        </Link>
        <Link to="/dashboard/jobs" className={linkClass("/dashboard/jobs")} onClick={() => setIsOpen(false)}>
          Jobs
        </Link>
        <Link to="/dashboard/events" className={linkClass("/dashboard/events")} onClick={() => setIsOpen(false)}>
          Events
        </Link>
      </nav>

      <div className="border-t pt-4">
        <p className="text-sm font-semibold text-gray-500 mb-2">Navigate Site</p>
        <nav className="flex flex-col space-y-2">
          <Link to="/" className={linkClass("/")} onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/about" className={linkClass("/about")} onClick={() => setIsOpen(false)}>
            About
          </Link>
          <Link to="/gallery" className={linkClass("/gallery")} onClick={() => setIsOpen(false)}>
            Gallery
          </Link>
          <Link to="/newsroom" className={linkClass("/newsroom")} onClick={() => setIsOpen(false)}>
            Newsroom
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
