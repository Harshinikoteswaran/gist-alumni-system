import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./components/PublicLayout";
import DashboardLayout from "./components/DashboardLayout";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { ToastProvider } from "./components/ToastProvider";

import Home from "./pages/Home";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import AlumniDashboard from "./pages/AlumniDashboard";
import AlumniDirectory from "./pages/AlumniDirectory";
import AlumniJobs from "./pages/AlumniJobs";
import AlumniEvents from "./pages/AlumniEvents";
import Newsroom from "./pages/Newsroom";
import AdminPendingUsers from "./pages/AdminPendingUsers";
import SetPassword from "./pages/SetPassword";
import ForgotPassword from "./pages/ForgotPassword";

import AdminDashboard from "./pages/AdminDashboard";
import AdminOverview from "./pages/AdminOverview";
import AdminGallery from "./pages/AdminGallery";
import AdminAlumni from "./pages/AdminAlumni";
import AdminEvents from "./pages/AdminEvents";
import AdminJobs from "./pages/AdminJobs";
import AdminNewsletters from "./pages/AdminNewsletters";
import AdminLogin from "./pages/AdminLogin";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <Routes>

        {/* PUBLIC ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/newsroom" element={<Newsroom />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Alumni Dashboard */}
          <Route
            path="/dashboard"
            element={
              <RoleProtectedRoute allowedRole="alumni">
                <DashboardLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<AlumniDashboard />} />
            <Route path="directory" element={<AlumniDirectory />} />
            <Route path="jobs" element={<AlumniJobs />} />
            <Route path="events" element={<AlumniEvents />} />
          </Route>

          <Route
            path="/admin-dashboard"
            element={
              <RoleProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="alumni" element={<AdminAlumni />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="newsletters" element={<AdminNewsletters />} />
            <Route path="pending-users" element={<AdminPendingUsers />} />
          </Route>
        </Route>

        {/* ADMIN ROUTES */}
        <Route path="/admin-login" element={<AdminLogin />} />

        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>
);
