"use client";

import { useState } from "react";
import { updatePassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

const SettingsPage = () => {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");
    setError("");
    
    try {
      await updateProfile(user, { displayName });
      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage("");
    setError("");
    
    try {
      await updatePassword(user, newPassword);
      setMessage("Password updated successfully!");
      setNewPassword("");
    } catch (err: any) {
      // Firebase requires recent login to change password. We'll handle generic error for now.
      setError(err.message || "Failed to update password. You may need to log out and log back in first.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-10 flex-1">Please sign in to view settings.</div>;
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>

      {message && <div className="bg-green-50 text-green-600 p-4 rounded-md">{message}</div>}
      {error && <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Settings */}
        <div className="bg-white p-6 rounded-md shadow-sm flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h2>
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Display Name</label>
              <input 
                type="text" 
                className="p-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-lamaSky" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Email (Cannot be changed here)</label>
              <input 
                type="email" 
                className="p-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 outline-none cursor-not-allowed" 
                value={user.email || ""}
                disabled
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-lamaSky text-white px-4 py-2 rounded-md font-semibold hover:bg-lamaSkyLight transition-all mt-2 w-max"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="bg-white p-6 rounded-md shadow-sm flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Security</h2>
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">New Password</label>
              <input 
                type="password" 
                className="p-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-lamaSky" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-lamaPurple text-white px-4 py-2 rounded-md font-semibold hover:bg-lamaPurpleLight transition-all mt-2 w-max"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
