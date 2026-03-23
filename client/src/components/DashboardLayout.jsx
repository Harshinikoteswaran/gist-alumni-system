import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-220px)] flex bg-gray-100 relative overflow-x-hidden">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 w-full min-w-0">
        <div className="md:hidden flex items-center justify-between gap-3 p-4 bg-white shadow-sm">
          <button onClick={() => setIsOpen(true)} className="text-xl font-bold px-2">
            Menu
          </button>
          <h2 className="text-base sm:text-lg font-semibold text-[#253B7B] truncate">Alumni Dashboard</h2>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
