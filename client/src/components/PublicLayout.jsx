import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import logo from "../assets/logo.png";
import Login from "../pages/Login";
import Register from "../pages/Register";
import { Menu, X } from "lucide-react";

function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const role = localStorage.getItem("role");
  const isLoggedIn = Boolean(role);

  const navLinks = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/about", label: "About" },
      { to: "/gallery", label: "Gallery" },
      { to: "/newsroom", label: "Newsroom" },
    ],
    [],
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-100 px-4 sm:px-6 md:px-14 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="Logo" className="h-14 w-14 md:h-20 md:w-20 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-3xl lg:text-[2rem] font-bold text-red-700 leading-tight">
                GEETHANJALI INSTITUTE OF SCIENCE & TECHNOLOGY
              </h1>
              <p className="text-xs sm:text-sm md:text-lg text-blue-900 font-semibold leading-tight">
                Computer Science Alumni Network
              </p>
            </div>
          </div>

          <div className="hidden md:flex gap-3 shrink-0">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-4 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate(role === "admin" ? "/admin-dashboard" : "/dashboard")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          <button className="md:hidden shrink-0" onClick={() => setIsMenuOpen((prev) => !prev)}>
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white shadow rounded-lg p-4 space-y-4">
            <div className="flex flex-col text-center gap-3">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2">
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      setIsLoginOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full border border-orange-600 text-orange-600 py-2 rounded"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setIsRegisterOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-orange-600 text-white py-2 rounded"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate(role === "admin" ? "/admin-dashboard" : "/dashboard");
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded"
                  >
                    Dashboard
                  </button>
                  <button onClick={handleLogout} className="w-full bg-red-600 text-white py-2 rounded">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <nav className="hidden md:block bg-orange-600 py-3">
        <div className="flex justify-center gap-10 text-white font-medium">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-gray-200 transition">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-grow">
        <Outlet context={{ openLogin: () => setIsLoginOpen(true) }} />
      </main>

      <footer className="bg-gray-900 text-gray-200 mt-10">
        <div className="max-w-6xl mx-auto px-8 md:px-10 py-10 grid gap-8 md:grid-cols-[1.2fr_0.9fr_0.9fr] items-start">
          <div className="md:pr-4">
            <h3 className="text-lg font-semibold mb-2">Geethanjali Institute of Science & Technology</h3>
            <p className="text-sm text-gray-400">
              Gangavaram, Kovur, Nellore District, Andhra Pradesh, India.
            </p>
            <p className="text-sm text-gray-400 mt-2">Email: cse.alumni@gist.edu.in</p>
          </div>

          <div className="md:justify-self-center md:px-2">
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <div className="flex flex-col gap-1 text-sm text-gray-300">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="hover:text-white">
                  {link.label}
                </Link>
              ))}
              {!isLoggedIn && (
                <>
                  <button onClick={() => setIsLoginOpen(true)} className="text-left hover:text-white">
                    Login
                  </button>
                  <button onClick={() => setIsRegisterOpen(true)} className="text-left hover:text-white">
                    Register
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="md:justify-self-center md:px-2">
            <h4 className="font-semibold mb-2">Connect</h4>
            <div className="flex flex-col gap-1 text-sm text-gray-300">
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white">
                LinkedIn
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="hover:text-white">
                Instagram
              </a>
            </div>
          </div>
        </div>
        <p className="border-t border-gray-700 text-center py-4 text-xs text-gray-400">
          Copyright {new Date().getFullYear()} GIST CSE Alumni Network
        </p>
      </footer>

      {isLoginOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
            >
              x
            </button>
            <Login onClose={() => setIsLoginOpen(false)} />
          </div>
        </div>
      )}

      {isRegisterOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative">
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
            >
              x
            </button>
            <Register
              onClose={() => setIsRegisterOpen(false)}
              onRegistered={() => {
                setIsRegisterOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicLayout;
