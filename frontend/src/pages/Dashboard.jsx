import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CSS/Dashboard.css";

const API_BASE = "https://onlinedonation.onrender.com/api";

const Dashboard = () => {
  const [donor, setDonor] = useState({ username: "Guest", email: "" });
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    activeCampaigns: 0,
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [recommendedCampaigns, setRecommendedCampaigns] = useState([]);
  const [volunteer, setVolunteer] = useState(null);
  const [notification, setNotification] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch all dashboard info
  const fetchDashboard = async () => {
    if (!token) return;
    try {
      // User info
      const userRes = await axios.get(`${API_BASE}/users/email`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonor(userRes.data);
      const email = userRes.data.email;

      // Volunteer info
      const volRes = await axios.get(`${API_BASE}/volunteers/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const vol = volRes.data.find((v) => v.email === email);
      if (vol) {
        setVolunteer(vol);

        // Notification logic inxcluding resubmission
        let notif = "";
        if (vol.allowResubmit) {
          notif = "🔄 Admin requested you to update your application.";
        } else if (vol.status === "Approved" && vol.tasks?.length > 0) {
          const pendingTasks = vol.tasks.filter(t => !t.completed).map(t => t.name).join(", ");
          notif = pendingTasks
            ? `✅ You have tasks assigned: ${pendingTasks}`
            : "✅ You have been approved as a volunteer!";
        } else if (vol.status === "Approved") {
          notif = "✅ You have been approved as a volunteer!";
        } else if (vol.status === "Rejected") {
          notif = "❌ Your volunteer application was not approved.";
        } else {
          notif = "⏳ Your volunteer application is pending approval.";
        }
        setNotification(notif);
      }

      // Stats
      const statsRes = await axios.get(`${API_BASE}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats({
        totalDonations: statsRes.data.totalDonations,
        totalAmount: statsRes.data.totalAmountCollected,
        activeCampaigns: statsRes.data.totalCampaigns,
      });

      // Recent donations
      const recentRes = await axios.get(`${API_BASE}/dashboard/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allDonations = recentRes.data || [];
      const latestTwo = allDonations
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2);
      setRecentDonations(latestTwo);

      // Recommended campaigns
      const recRes = await axios.get(`${API_BASE}/dashboard/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendedCampaigns(recRes.data);

    } catch (err) {
      console.error("❌ Dashboard fetch error", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const handleViewCampaign = (campaignName) => {
    navigate(`/campaigns?name=${encodeURIComponent(campaignName)}`);
  };

  const handleDonateNow = (campaignName) => {
    navigate(`/donations?campaignName=${encodeURIComponent(campaignName)}`);
  };

  // Mark a volunteer task as completed
  const markTaskCompleted = async (taskName) => {
    if (!volunteer) return;
    try {
      await axios.put(`${API_BASE}/volunteers/${volunteer.id}/task/completed`, { taskName });
      fetchDashboard(); // refresh tasks
      alert(`🎉 Task "${taskName}" marked as completed!`);
    } catch {
      alert("❌ Failed to mark task as completed.");
    }
  };

  return (
    <div className="dashboard-page">
      {/* Top Section */}
      <div className="dashboard-top">
        <div className="welcome-text">
          <h1>Welcome back, {donor.username || "User"} 👋</h1>
          <p>Track your donations and discover new causes to support.</p>
        </div>
        <div className="user-info">
          <h3>{donor.username}</h3>
          <p>{donor.email}</p>
        </div>
      </div>

     

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <h2>{stats.totalDonations}</h2>
          <p>Total Donations Made</p>
        </div>
        <div className="stat-card green">
          <h2>₹{stats.totalAmount.toLocaleString()}</h2>
          <p>Total Amount Donated</p>
        </div>
        <div className="stat-card yellow">
          <h2>{stats.activeCampaigns}</h2>
          <p>Active Campaigns</p>
        </div>
      </div>
 {/* Volunteer Section */}
      {volunteer && (
        <div className="volunteer-dashboard">
          <h2>🤝 Volunteer Status</h2>
          <p>
            <b>Status:</b>{" "}
            <span style={{ color: volunteer.status === "Approved" ? "green" :
                            volunteer.status === "Rejected" ? "red" : "orange" }}>
              {volunteer.status || "Pending"}
            </span>
          </p>

          {volunteer.tasks?.length > 0 && (
            <div>
              <b>Assigned Tasks:</b>
              <ul>
                {volunteer.tasks.map((task, idx) => (
                  <li key={idx}>
                    {task.name} {task.completed ? "✅ Completed" : ""}
                    {!task.completed && (
                      <button
                        onClick={() => markTaskCompleted(task.name)}
                        className="complete-btn"
                      >
                        Mark Completed
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {notification && <p className="volunteer-notification">{notification}</p>}
        </div>
      )}
      {/* Recent Donations */}
      <div className="connections-section">
        <h2>🕒 Your Recent Donations</h2>
        {recentDonations.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>You haven't donated yet.</p>
        ) : (
          recentDonations.map((donation) => (
            <div key={donation.id} className="plan-box">
              <div className="plan-details">
                <p><b>Donor Name:</b> {donation.donorName || donor.username}</p>
                <p><b>Campaign:</b> {donation.campaignName || "Unknown Campaign"}</p>
                <p><b>Amount:</b> ₹{donation.amount}</p>
                <p><b>Date:</b> {donation.date ? new Date(donation.date).toLocaleDateString() : "-"}</p>
                <p><b>Status:</b> {donation.status === "Success" || donation.status === "Processed"
                    ? "✅ Payment Successful"
                    : donation.status === "Pending"
                    ? "⏳ Pending"
                    : "❌ Failed"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Recommended Campaigns */}
      <div className="recommendations">
        <h2>🤖 AI Recommended Campaigns</h2>
        <div className="recs-grid">
          {recommendedCampaigns.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No campaigns to recommend right now.</p>
          ) : (
            recommendedCampaigns.map((campaign, index) => (
              <div key={index} className="rec-card">
                {campaign.match && <span className="match-badge">{campaign.match}% Match</span>}
                <h3>{campaign.name}</h3>
                <p>{campaign.description?.substring(0, 100)}...</p>
                <p><b>Goal:</b> ₹{campaign.goal?.toLocaleString() || 0}</p>
                <p><b>Collected:</b> ₹{campaign.raised?.toLocaleString() || 0}</p>

                <div className="rec-actions">
                  <button className="details-btn" onClick={() => handleViewCampaign(campaign.name)}>View Campaign</button>
                  <button className="subscribe-btn" onClick={() => handleDonateNow(campaign.name)}>Donate Now 💖</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
