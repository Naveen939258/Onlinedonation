import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./CSS/Profile.css";

const API_BASE = "https://onlinedonation.onrender.com/api";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxzumlzrv/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "donation_preset";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [message, setMessage] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch user profile + total donations
  const fetchProfile = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE}/users/email`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const donationsRes = await axios.get(`${API_BASE}/donations/my`, {
        headers: { "auth-token": token },
      });
      const totalDonations = donationsRes.data?.length || 0;

      const userData = {
        ...res.data,
        totalDonations,
      };

      setUser(userData);
      setProfileImage(userData.profileImage || null);
      setFormData({
        username: userData.username,
        email: userData.email,
        phone: userData.phone || "",
        password: "",
      });

      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error("❌ Failed to load profile", err);
      setMessage("Failed to load profile ❌");
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Upload image to Cloudinary
  const uploadImageToCloud = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      return result.secure_url;
    } catch (err) {
      console.error("Image upload failed", err);
      return null;
    }
  };

  // Handle profile update
  const handleUpdate = async () => {
    if (!user) return;
    if (!currentPassword) {
      setMessage("❌ Current password is required");
      return;
    }

    let profileImageUrl = profileImage;
    if (profileImage && profileImage instanceof File) {
      profileImageUrl = await uploadImageToCloud(profileImage);
      if (!profileImageUrl) {
        setMessage("❌ Failed to upload image");
        return;
      }
    }

    const payload = {
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      currentPassword,
      password: formData.password?.trim() !== "" ? formData.password : undefined,
      profileImage: profileImageUrl,
    };

    try {
      const res = await axios.put(`${API_BASE}/users/${user.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      setProfileImage(res.data.profileImage || null);
      setEditMode(false);
      setCurrentPassword("");
      setFormData({
        username: res.data.username,
        email: res.data.email,
        phone: res.data.phone || "",
        password: "",
      });
      localStorage.setItem("user", JSON.stringify(res.data));
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      console.error("❌ Update failed", err.response?.data || err);
      setMessage(
        `❌ ${err.response?.data?.message || "Update failed — check current password or fields"}`
      );
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(file);
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="profile-page">
      <div className="profile-avatar">
        {profileImage ? (
          <img
            src={typeof profileImage === "string" ? profileImage : URL.createObjectURL(profileImage)}
            alt="Profile"
            className="profile-image"
          />
        ) : (
          user.username?.charAt(0).toUpperCase()
        )}
      </div>

      <h1 className="profile-title">My Profile</h1>
      <div className="profile-card">
        {message && <p className="profile-message">{message}</p>}

        {!editMode ? (
          <>
            <p><strong>Name:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone || "-"}</p>
            <p><strong>Total Donations:</strong> {user.totalDonations || 0}</p>
            <button onClick={() => setEditMode(true)} className="edit-btn">
              ✏ Edit Profile
            </button>
          </>
        ) : (
          <>
            <div className="profile-image-wrapper">
              <img
                src={
                  profileImage
                    ? typeof profileImage === "string"
                      ? profileImage
                      : URL.createObjectURL(profileImage)
                    : "/default-avatar.png"
                }
                alt="Profile"
                className="profile-image"
              />
              <input type="file" onChange={handleProfileImageChange} />
            </div>

            <input
              type="text"
              placeholder="Name"
              value={formData.username || ""}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone"
              value={formData.phone || ""}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <input
              type="password"
              placeholder="Current Password (required)"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password (optional)"
              value={formData.password || ""}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <div className="profile-actions">
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    username: user.username,
                    email: user.email,
                    phone: user.phone || "",
                    password: "",
                  });
                  setCurrentPassword("");
                  setProfileImage(user.profileImage || null);
                  setMessage("");
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button onClick={handleUpdate} className="save-btn">
                Save
              </button>
            </div>

            <p className="profile-note">
              * Current password is required for any change.<br />
              * New password is only needed if you want to change it.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
