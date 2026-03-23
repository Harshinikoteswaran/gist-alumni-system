import { useState } from "react";
import API from "../services/api";

function CreateProfileForm({ onProfileCreated }) {
  const [formData, setFormData] = useState({
    rollNumber: "",
    batch: "",
    degree: "",
    company: "",
    position: "",
    location: "",
    bio: "",
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
      if (profilePictureFile) {
        payload.append("profilePicture", profilePictureFile);
      }

      const { data } = await API.post("/alumni", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onProfileCreated(data);
    } catch (error) {
      console.error(error);
      alert("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-2xl">

        <h2 className="text-3xl font-bold text-[#253B7B] mb-8 text-center">
          Complete Your Alumni Profile
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="block mb-1 font-medium">Roll Number</label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3 rounded-lg outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Batch</label>
            <input
              type="number"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3 rounded-lg outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Degree</label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3 rounded-lg outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3 rounded-lg outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3 rounded-lg outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3 rounded-lg outline-none transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePictureFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3 rounded-lg outline-none transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 p-3 rounded-lg outline-none transition"
            />
          </div>

          <div className="md:col-span-2">
            <button
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateProfileForm;
