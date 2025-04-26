import { useEffect, useState } from "react";
import axios from "axios";
import SkeletonCard from "../components/SkeletonCard";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Unauthorized. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Unauthorized. Please log in.");
        } else {
          setError("Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8">
        <div className="max-w-4xl mx-auto bg-[#2C2C2C] p-8 rounded-lg shadow-md space-y-6">
          <SkeletonCard className="h-10 w-48" />
          <SkeletonCard className="h-6 w-32" />
          <SkeletonCard className="h-4 w-full" />
          <SkeletonCard className="h-20 w-full" />
          <SkeletonCard className="h-20 w-full" />
          <SkeletonCard className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] text-[#E5CBBE] p-8">
      <div className="max-w-4xl mx-auto bg-[#2C2C2C] p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-6">Your Profile</h1>
        <h2 className="text-xl font-semibold mb-2">Welcome, {profile?.name?.split(" ")[0] || "User"}</h2>
        <p className="mb-4 text-[#A58077]">Manage your account information below.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#A58077]">Name</label>
            <p className="text-lg">{profile.name}</p>
          </div>
          <div>
            <label className="block text-sm text-[#A58077]">Email</label>
            <p className="text-lg">{profile.email}</p>
          </div>
          <div>
            <label className="block text-sm text-[#A58077]">Phone</label>
            <p className="text-lg">{profile.phone}</p>
          </div>
          <div>
            <label className="block text-sm text-[#A58077]">Role</label>
            <p className="text-lg capitalize">{profile.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
