// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../CSS/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    campaigns: 0,
    activeCampaigns: 0,
    donors: 0,
    verifiedDonors: 0,
    blockedDonors: 0,
    donations: 0,
    totalFunds: 0,
    pendingDonations: 0,
    partners: 0,
    approvedPartners: 0,
    pendingPartners: 0,
    volunteers: 0,
    approvedVolunteers: 0,
    pendingVolunteers: 0,
    topCampaigns: [],
  });

  const token = localStorage.getItem("token");

  const fetchStats = useCallback(async () => {
    try {
      // ✅ Fetch donors
      const donorRes = await axios.get("http://localhost:8080/api/admin/donors", {
        headers: { "auth-token": token },
      });
      const donors = donorRes.data || [];
      const totalDonors = donors.length;
      const verifiedDonors = donors.filter((d) => d.verified).length;
      const blockedDonors = donors.filter((d) => d.blocked).length;

      // ✅ Fetch campaigns
      const campaignRes = await axios.get("http://localhost:8080/api/admin/campaigns", {
        headers: { "auth-token": token },
      });
      const campaigns = campaignRes.data || [];
      const activeCampaigns = campaigns.filter((c) => c.status === "Active").length;
      const topCampaigns = [...campaigns]
        .sort((a, b) => ((b.raised || 0) - (a.raised || 0)))
        .slice(0, 5);

      // ✅ Fetch donations
      const donationRes = await axios.get("http://localhost:8080/api/donations/admin/all", {
        headers: { "auth-token": token },
      });
      const donations = donationRes.data || [];
      const totalFunds = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const pendingDonations = donations.filter((d) => d.status !== "Processed").length;

      // ✅ Fetch partners
      const partnerRes = await axios.get("http://localhost:8080/api/partners/all");
      const partners = partnerRes.data || [];
      const totalPartners = partners.length;
      const approvedPartners = partners.filter((p) => p.status === "APPROVED").length;
      const pendingPartners = partners.filter((p) => p.status === "PENDING").length;

      // ✅ Fetch volunteers
      const volunteerRes = await axios.get("http://localhost:8080/api/volunteers/all");
      const volunteers = volunteerRes.data || [];
      const totalVolunteers = volunteers.length;
      const approvedVolunteers = volunteers.filter((v) => v.status === "Approved").length;
      const pendingVolunteers = volunteers.filter((v) => v.status === "Pending").length;

      // ✅ Update all stats
      setStats({
        campaigns: campaigns.length,
        activeCampaigns,
        donors: totalDonors,
        verifiedDonors,
        blockedDonors,
        donations: donations.length,
        totalFunds,
        pendingDonations,
        partners: totalPartners,
        approvedPartners,
        pendingPartners,
        volunteers: totalVolunteers,
        approvedVolunteers,
        pendingVolunteers,
        topCampaigns,
      });
    } catch (err) {
      console.error("❌ Failed to fetch dashboard stats:", err.response?.data || err.message);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-icon">📊</div>
        <h2>Admin Dashboard</h2>
        <p>Welcome back, Admin</p>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <div className="action-card create">
          <div className="action-icon">📢➕</div>
          <h3>Create Campaign</h3>
          <p>Add new campaigns to collect donations</p>
          <button onClick={() => navigate("/campaigns")} className="action-btn create-btn">➕ Create Campaign</button>
        </div>

        <div className="action-card manage">
          <div className="action-icon">👥</div>
          <h3>Manage Donors</h3>
          <p>View, edit, or verify donors</p>
          <button onClick={() => navigate("/donors")} className="action-btn manage-btn">⚙ Manage Donors</button>
        </div>

        <div className="action-card manage">
          <div className="action-icon">🤝</div>
          <h3>Manage Partners</h3>
          <p>Approve or assign campaigns to partners</p>
          <button onClick={() => navigate("/partner")} className="action-btn manage-btn">⚙ Manage Partners</button>
        </div>

        <div className="action-card manage">
          <div className="action-icon">🧍</div>
          <h3>Manage Volunteers</h3>
          <p>Approve or assign volunteer tasks</p>
          <button onClick={() => navigate("/volunteers")} className="action-btn manage-btn">⚙ Manage Volunteers</button>
        </div>

        <div className="action-card manage">
          <div className="action-icon">💰</div>
          <h3>Manage Donations</h3>
          <p>View all donations and their status</p>
          <button onClick={() => navigate("/donations")} className="action-btn manage-btn">⚙ Manage Donations</button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-grid1">
        <div className="stat-card1"><h3>Total Campaigns</h3><p>{stats.campaigns}</p></div>
        <div className="stat-card1"><h3>Active Campaigns</h3><p>{stats.activeCampaigns}</p></div>
        <div className="stat-card1"><h3>Total Donors</h3><p>{stats.donors}</p></div>
        <div className="stat-card1"><h3>Verified Donors</h3><p>{stats.verifiedDonors}</p></div>
        <div className="stat-card1"><h3>Blocked Donors</h3><p>{stats.blockedDonors}</p></div>
        <div className="stat-card1"><h3>Total Partners</h3><p>{stats.partners}</p></div>
        <div className="stat-card1"><h3>Approved Partners</h3><p>{stats.approvedPartners}</p></div>
        <div className="stat-card1"><h3>Pending Partners</h3><p>{stats.pendingPartners}</p></div>
        <div className="stat-card1"><h3>Total Volunteers</h3><p>{stats.volunteers}</p></div>
        <div className="stat-card1"><h3>Volunteers</h3><p>{stats.approvedVolunteers}</p></div>
        <div className="stat-card1"><h3>Pending Volunteers</h3><p>{stats.pendingVolunteers}</p></div>
        <div className="stat-card1"><h3>Total Donations</h3><p>{stats.donations}</p></div>
        <div className="stat-card1"><h3>Pending Donations</h3><p>{stats.pendingDonations}</p></div>
        <div className="stat-card1"><h3>Total Funds Raised</h3><p>₹{stats.totalFunds.toLocaleString()}</p></div>
      </div>

      {/* Top Campaigns */}
      <div className="top-campaigns">
        <h3>🏆 Top 5 Campaigns</h3>
        <ul>
          {stats.topCampaigns.map((c, i) => (
            <li key={i}>
              {c.name || c.campaignName} — ₹{(c.raised || 0).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
