import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUserEdit,
  FaEnvelope,
  FaPhone,
  FaCogs,
  FaUsers,
  FaLock,
} from "react-icons/fa";
import "../CSS/AdminProfile.css";

const API_BASE = process.env.REACT_APP_API_URL || "https://onlinedonation.onrender.com";

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ✅ Fetch admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/admin/profile`, {
          headers: { "auth-token": token },
        });
        setAdminData(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // ✅ Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/admin/stats`, {
          headers: { "auth-token": token },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, [token]);

  // ✅ Input change handler
  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  // ✅ Save updated profile
  const handleSave = async () => {
    if (!currentPassword.trim()) {
      alert("⚠️ Please enter your current password before saving.");
      return;
    }

    const updatePayload = {
      name: adminData.name,
      email: adminData.email,
      phone: adminData.phone,
      organization: adminData.organization,
      currentPassword,
      newPassword,
    };

    try {
      const res = await axios.put(`${API_BASE}/api/admin/profile`, updatePayload, {
        headers: { "auth-token": token },
      });

      alert("✅ Profile updated successfully!");
      setAdminData(res.data);
      setIsEditing(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      alert(err.response?.data?.error || "❌ Failed to update profile.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!adminData) return <div>No admin data found.</div>;

  return (
    <div className="admin-profile-page">
      {/* Header */}
      <header className="admin-profile-header">
        <div className="admin-info">
          <img
            src={
              adminData.profileImage ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="Admin"
            className="admin-avatar"
          />
          <div>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={adminData.name}
                onChange={handleChange}
                className="name-input"
              />
            ) : (
              <h1>{adminData.name}</h1>
            )}
            <p>{adminData.organization || "HopeBridge Foundation"}</p>
          </div>
        </div>

        {/* Edit / Save Controls */}
        <div className="edit-controls">
          <button
            className="edit-btn"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            <FaUserEdit /> {isEditing ? "Save Changes" : "Edit Profile"}
          </button>

          {/* 🔒 Password fields only visible while editing */}
          {isEditing && (
            <div className="password-edit-box">
              <div className="password-field">
                <FaLock />
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="password-field">
                <FaLock />
                <input
                  type="password"
                  placeholder="New password (optional)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Stats */}
      <section className="admin-stats">
        <div className="stat-card">
          <h2>{stats.campaigns || 0}</h2>
          <p>Campaigns</p>
        </div>
        <div className="stat-card">
          <h2>{stats.donors || 0}</h2>
          <p>Donors</p>
        </div>
        <div className="stat-card">
          <h2>{stats.volunteers || 0}</h2>
          <p>Volunteers</p>
        </div>
        <div className="stat-card">
          <h2>₹{(stats.totalFunds || 0).toLocaleString()}</h2>
          <p>Total Funds Raised</p>
        </div>
      </section>

      {/* Profile Details */}
      <section className="admin-details">
        <h2>Profile Details</h2>
        <div className="details-grid">
          <div className="detail-item">
            <FaEnvelope />
            <input
              name="email"
              value={adminData.email || ""}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>

          <div className="detail-item">
            <FaPhone />
            <input
              name="phone"
              value={adminData.phone || ""}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>

          <div className="detail-item">
            <FaCogs />
            <input
              name="organization"
              value={adminData.organization || ""}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>

          <div className="detail-item">
            <FaUsers />
            <input
              name="role"
              value="Admin"
              disabled
              readOnly
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminProfile;
