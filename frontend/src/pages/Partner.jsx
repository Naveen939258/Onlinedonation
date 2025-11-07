import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CSS/Partner.css";

const API_BASE = "http://localhost:8080/api";

const Partner = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [partnerData, setPartnerData] = useState(null);
  const [partnerCampaigns, setPartnerCampaigns] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [form, setForm] = useState({
    organizationName: "",
    contactPerson: "",
    email: "",
    phone: "",
    city: "",
    message: "",
    logo: "",
  });

  // Check login and load user
  useEffect(() => {
    if (!token) {
      alert("⚠️ Please login to become a partner.");
      navigate("/login");
      return;
    }

    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
      setForm((prev) => ({
        ...prev,
        email: loggedInUser.email || "",
        contactPerson: loggedInUser.username || "",
      }));
      fetchPartner(loggedInUser.email);
    }
    // eslint-disable-next-line
  }, [navigate, token]);

  // Auto-refresh notifications every 15 seconds
  useEffect(() => {
    if (partnerData?.id) {
      const interval = setInterval(() => {
        fetchNotifications(partnerData.id);
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [partnerData]);

  // Fetch partner info
  const fetchPartner = async (email) => {
    try {
      const res = await axios.get(`${API_BASE}/partners/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const partner = res.data.find((p) => p.email === email);
      if (partner) {
        setPartnerData(partner);
        fetchPartnerCampaigns(partner.id);
        fetchNotifications(partner.id);
      }
    } catch (err) {
      console.error("❌ Error fetching partner:", err);
      setStatusMessage("❌ Failed to load partner data.");
    }
  };

  // Fetch campaigns assigned to partner
  const fetchPartnerCampaigns = async (partnerId) => {
    try {
      const res = await axios.get(`${API_BASE}/partners/${partnerId}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPartnerCampaigns(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching campaigns:", err);
    }
  };

  // Fetch notifications
  const fetchNotifications = async (partnerId) => {
    try {
      const res = await axios.get(`${API_BASE}/partners/${partnerId}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    }
  };

  // Form input handler
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit partnership request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("");

    try {
      // Check if already submitted
      const existing = await axios.get(`${API_BASE}/partners/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const found = existing.data.find((p) => p.email === form.email);
      if (found) {
        setPartnerData(found);
        setStatusMessage(`⚠️ You already submitted a request. Status: ${found.status}`);
        return;
      }

      const res = await axios.post(`${API_BASE}/partners/register`, form, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      setStatusMessage("✅ Partnership request submitted successfully! Pending admin approval.");
      setPartnerData(res.data);
    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Failed to submit request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // If partner data not available, show registration form
  if (!partnerData) {
    return (
      <div className="partner-page">
        <section className="partner-hero">
          <h1>Partner With Us 🤝</h1>
          <p>Collaborate with us to make a greater social impact together.</p>
        </section>

        <section className="partner-form-section">
          <form className="partner-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="organizationName"
              placeholder="Organization Name"
              value={form.organizationName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="contactPerson"
              placeholder="Contact Person"
              value={form.contactPerson}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              readOnly
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
            />
            <input
              type="text"
              name="logo"
              placeholder="Logo URL (optional)"
              value={form.logo}
              onChange={handleChange}
            />
            <textarea
              name="message"
              placeholder="Tell us how you'd like to collaborate..."
              value={form.message}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Partnership Request"}
            </button>
          </form>
          {statusMessage && <p className="partner-status">{statusMessage}</p>}
        </section>
      </div>
    );
  }

  // Partner dashboard view
  return (
    <div className="partner-dashboard-page">
      <section className="partner-hero">
        <h1>Welcome, {user.username} 🤝</h1>
        <p>
          Your partner status:{" "}
          <span
            className={`status-badge ${
              partnerData.status === "APPROVED"
                ? "green"
                : partnerData.status === "REJECTED"
                ? "red"
                : "yellow"
            }`}
          >
            {partnerData.status}
          </span>
        </p>
      </section>

      {partnerData.status === "APPROVED" && (
        <>
          <section className="partner-campaigns-section">
            <h2>📌 Campaigns Linked To You</h2>
            {partnerCampaigns.length === 0 ? (
              <p>No campaigns assigned yet.</p>
            ) : (
              <div className="campaigns-grid">
                {partnerCampaigns.map((c) => (
                  <div key={c.id} className="campaign-card">
                    <h3>{c.campaignName}</h3>
                    <p>{c.description?.substring(0, 100)}...</p>
                    <p><b>Goal:</b> ₹{c.goal?.toLocaleString()}</p>
                    <p><b>Raised:</b> ₹{c.raised?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="partner-notifications">
            <h2>🔔 Notifications</h2>
            {notifications.length === 0 ? (
              <p>No new notifications.</p>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id}>
                    <span>{n.message}</span>
                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {partnerData.status === "PENDING" && (
        <p className="notification">⏳ Your partnership request is pending admin approval.</p>
      )}
      {partnerData.status === "REJECTED" && (
        <p className="notification">❌ Your partnership request was rejected by admin.</p>
      )}

      {statusMessage && <p className="partner-status">{statusMessage}</p>}
    </div>
  );
};

export default Partner;
