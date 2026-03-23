import { useEffect, useState } from "react";
import API from "../services/api";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const fetchImages = async () => {
    try {
      const res = await API.get("/gallery");
      setImages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await API.delete(`/gallery/${id}`);
      fetchImages();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-14 px-6 md:px-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-12">
        Alumni Gallery
      </h2>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <div
            key={img._id}
            className="relative bg-white rounded-xl shadow-md overflow-hidden transition duration-300 hover:-translate-y-1"
          >
            <button onClick={() => setSelected(img)} className="w-full text-left">
              <img src={img.imageUrl} alt={img.title} className="w-full h-64 object-cover" />
            </button>

            {isAdmin && (
              <button
                onClick={() => handleDelete(img._id)}
                className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            )}

            <div className="p-4 text-center">
              <p className="font-semibold">{img.title}</p>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white max-w-lg w-full rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selected.imageUrl} alt={selected.title} className="w-full h-64 object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-900">{selected.title}</h3>
              <p className="text-gray-600 mt-2">{selected.description || "No description available."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
