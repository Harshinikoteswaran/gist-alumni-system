import React from "react";
import campus1 from "../assets/campus1.jpg";
import campus2 from "../assets/campus2.jpg";
import campus3 from "../assets/campus3.jpg";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { openLogin } = useOutletContext();
  const navigate = useNavigate();

  const images = [campus1, campus2, campus3];
  const [current, setCurrent] = React.useState(0);
  const role = localStorage.getItem("role");
  const isLoggedIn = Boolean(role && localStorage.getItem("token"));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <>
      <div className="relative h-[300px] sm:h-[400px] md:h-[550px] lg:h-[650px] overflow-hidden">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Campus"
            className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-black/60 flex items-center justify-center px-6">
          <div className="text-center text-white max-w-4xl">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Welcome to CSE Alumni Network
            </h2>

            <p className="mt-3 sm:mt-5 text-sm sm:text-lg md:text-xl text-gray-200">
              Connecting Graduates | Building Futures | Strengthening Bonds
            </p>

            <div className="mt-6 sm:mt-8">
              {isLoggedIn ? (
                <button
                  onClick={() => navigate(role === "admin" ? "/admin-dashboard" : "/dashboard")}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700 transition shadow-lg"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={openLogin}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-orange-600 text-white text-sm sm:text-base rounded-md hover:bg-orange-700 transition shadow-lg"
                >
                  Alumni Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="py-12 sm:py-16 px-6 md:px-20 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h4 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">About this Alumni Website</h4>

          <p className="text-gray-600 leading-relaxed text-sm sm:text-base md:text-lg">
            This Alumni Network connects former students with the department and each other. It provides a platform
            to maintain professional connections, share news and events, find mentorship opportunities, and discover
            job and internship postings. Members can create profiles, list accomplishments, join events, and
            collaborate on projects. Our goal is to strengthen the alumni community and support career development for
            all members.
          </p>

          <div className="mt-8">
            {isLoggedIn ? (
              <button
                onClick={() => navigate(role === "admin" ? "/admin-dashboard" : "/dashboard")}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-md"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={openLogin}
                className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition shadow-md"
              >
                Login to Network
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
