import { useEffect, useState } from "react";
import API from "../services/api";
import CreateProfileForm from "../components/CreateProfileForm";

function AlumniDashboard() {
  const [profile, setProfile] = useState(undefined);
  const [editing, setEditing] = useState(false);
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

  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/alumni/profile");
      setProfile(data);
      if (data) {
        setFormData({
          rollNumber: data.rollNumber || "",
          batch: data.batch || "",
          degree: data.degree || "",
          company: data.company || "",
          position: data.position || "",
          location: data.location || "",
          bio: data.bio || "",
        });
      }
    } catch (error) {
      console.error(error);
      setProfile(null);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

      const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
      if (profilePictureFile) {
        payload.append("profilePicture", profilePictureFile);
      }

      await API.put("/alumni/profile", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchProfile();
      setEditing(false);
      setProfilePictureFile(null);
      alert("Profile updated successfully");
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  if (profile === undefined) {
    return <div className="p-10 text-center text-lg">Loading...</div>;
  }

  if (profile === null) {
    return <CreateProfileForm onProfileCreated={setProfile} />;
  }

  return (
    <div className="p-3 sm:p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-4 sm:p-5 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-8 min-w-0">
          <div>
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt={profile.user?.name} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover" />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-white">
                {profile.user?.name?.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 w-full min-w-0">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#253B7B] break-words">{profile.user?.name}</h2>
              <p className="text-gray-500 mt-1 break-all">{profile.user?.email}</p>
            </div>

            {!editing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard label="Roll Number" value={profile.rollNumber} />
                  <InfoCard label="Batch" value={profile.batch} />
                  <InfoCard label="Degree" value={profile.degree} />
                  <InfoCard label="Company" value={profile.company} />
                  <InfoCard label="Position" value={profile.position} />
                  <InfoCard label="Location" value={profile.location} />
                </div>
                <div className="mt-6 border rounded-lg p-5">
                  <p className="font-semibold text-[#253B7B] mb-2">About</p>
                  <p className="text-gray-700">{profile.bio || "No bio added yet."}</p>
                </div>
                <div className="mt-6">
                  <button onClick={() => setEditing(true)} className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600">
                    Edit Profile
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full min-w-0">
                <input type="file" accept="image/*" onChange={(e) => setProfilePictureFile(e.target.files?.[0] || null)} className="border p-2 rounded md:col-span-2 w-full min-w-0" />
                <input name="rollNumber" placeholder="Roll Number" value={formData.rollNumber} onChange={handleChange} className="border p-2 rounded w-full min-w-0" />
                <input name="batch" placeholder="Batch" value={formData.batch} onChange={handleChange} className="border p-2 rounded w-full min-w-0" />
                <input name="degree" placeholder="Degree" value={formData.degree} onChange={handleChange} className="border p-2 rounded w-full min-w-0" />
                <input name="company" placeholder="Company" value={formData.company} onChange={handleChange} className="border p-2 rounded w-full min-w-0" />
                <input name="position" placeholder="Position" value={formData.position} onChange={handleChange} className="border p-2 rounded w-full min-w-0" />
                <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="border p-2 rounded w-full min-w-0" />
                <textarea name="bio" placeholder="Bio" value={formData.bio} onChange={handleChange} rows={4} className="border p-2 rounded md:col-span-2 w-full min-w-0" />
                <div className="md:col-span-2 flex flex-wrap gap-3 mt-2">
                  <button className="px-5 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Save</button>
                  <button type="button" onClick={() => setEditing(false)} className="px-5 py-2 bg-gray-200 rounded">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-lg">{value || "Not Provided"}</p>
    </div>
  );
}

export default AlumniDashboard;
