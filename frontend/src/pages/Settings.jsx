import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./CSS/Settings.css";

const API_BASE = process.env.REACT_APP_API_URL || "https://onlinedonation.onrender.com/api";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxzumlzrv/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "donation_preset";

const Settings = () => {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [message, setMessage] = useState("");
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: true,
    app: true,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Fetch user data
  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/users/email`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setFormData({
        username: res.data.username,
        email: res.data.email,
        phone: res.data.phone || "",
        password: "",
      });
      setNotificationPrefs(res.data.notificationPrefs || notificationPrefs);
      setDarkMode(res.data.darkMode || false);
      setProfileImage(res.data.profileImage || null);
    } catch (err) {
      console.error("Failed to fetch user", err);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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

  // Update account info
  const handleUpdateAccount = async () => {
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
      notificationPrefs,
      darkMode,
    };

    try {
      const res = await axios.put(`${API_BASE}/users/${user.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setMessage("✅ Account updated successfully!");
      setCurrentPassword("");
      setFormData({ ...formData, password: "" });
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error("Update failed", err.response?.data || err);
      setMessage(
        `❌ ${err.response?.data?.message || "Update failed — check password/fields"}`
      );
    }
  };

  const handleToggleNotification = (type) => {
    setNotificationPrefs((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode", !darkMode);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(file);
  };

  const handleLogoutAll = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("loginStatusChanged"));
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await axios.delete(`${API_BASE}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleLogoutAll();
    } catch (err) {
      console.error("Delete failed", err.response?.data || err);
      setMessage("❌ Failed to delete account");
    }
  };

  if (!user) return <p>Loading settings...</p>;

  return (
    <div className={`settings-page ${darkMode ? "dark" : ""}`}>
      <h1 className="title">Settings</h1>
      {message && <p className="message">{message}</p>}

      {/* Account Section */}
      <section className="settings-section">
        <h2>Account Settings</h2>

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
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <button onClick={handleUpdateAccount}>Save Changes</button>
      </section>

      {/* Notifications */}
      <section className="settings-section">
        <h2>Notification Preferences</h2>
        {["email", "sms", "app"].map((type) => (
          <label key={type}>
            <input
              type="checkbox"
              checked={notificationPrefs[type]}
              onChange={() => handleToggleNotification(type)}
            />
            {type.toUpperCase()} Notifications
          </label>
        ))}
      </section>

      {/* Dark mode */}
      <section className="settings-section">
        <h2>Display Preferences</h2>
        <label>
          <input type="checkbox" checked={darkMode} onChange={handleToggleDarkMode} />
          Dark Mode
        </label>
      </section>

      {/* Security */}
      <section className="settings-section">
        <h2>Security & Privacy</h2>
        <button className="danger-btn" onClick={handleLogoutAll}>
          Logout from all devices
        </button>
        <button className="danger-btn delete-btn" onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </section>
    </div>
  );
};

export default Settings;
