import { useEffect, useRef, useState } from "react";
import API from "../services/api";

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchImages = async () => {
    try {
      const { data } = await API.get("/gallery");
      setImages(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load gallery");
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const resetForm = () => {
    setImage(null);
    setTitle("");
    setDescription("");
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFileInputKey((prev) => prev + 1);
  };

  const handleUpload = async () => {
    if (!editingId && !image) {
      alert("Please choose an image");
      return;
    }

    setUploading(true);

    try {
      if (editingId) {
        if (image) {
          const formData = new FormData();
          formData.append("image", image);
          formData.append("title", title);
          formData.append("description", description);
          await API.put(`/gallery/${editingId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await API.put(`/gallery/${editingId}`, { title, description });
        }
      } else {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("title", title);
        formData.append("description", description);
        await API.post("/gallery/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      resetForm();
      fetchImages();
      alert(editingId ? "Image updated successfully" : "Uploaded successfully");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await API.delete(`/gallery/${id}`);
      fetchImages();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  const handleEdit = (img) => {
    setEditingId(img._id);
    setTitle(img.title || "");
    setDescription(img.description || "");
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFileInputKey((prev) => prev + 1);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800">Manage Gallery</h2>

      <div ref={formRef} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-4">{editingId ? "Edit Image" : "Upload Image"}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Image title"
            className="border p-2 rounded w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-2 rounded w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            key={fileInputKey}
            ref={fileInputRef}
            type="file"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="border p-2 rounded w-full"
            accept="image/*"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 disabled:opacity-60 w-full"
          >
            {uploading ? "Saving..." : editingId ? "Update" : "Upload"}
          </button>
        </div>
        {editingId && (
          <button
            onClick={resetForm}
            className="mt-3 bg-gray-200 text-gray-800 px-4 py-1.5 rounded text-sm hover:bg-gray-300"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.map((img) => (
          <div key={img._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <img src={img.imageUrl} alt={img.title} className="w-full h-52 object-cover" />
            <div className="p-4">
              <p className="font-medium text-gray-800">{img.title}</p>
              <p className="text-sm text-gray-500 mt-1">{img.description || "No description"}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEdit(img)}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(img._id)}
                  className="bg-red-600 text-white px-4 py-1.5 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
