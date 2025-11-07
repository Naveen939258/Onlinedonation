// src/pages/Campaigns.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../CSS/Campaigns.css";
import { toast } from "react-toastify";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalDonations: 0,
    totalFunds: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [form, setForm] = useState({
    name: "",
    beneficiary: "",
    goal: "",
    raised: 0,
    description: "",
    impact: "",
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      const res = await axios.get("https://onlinedonation.onrender.com/api/admin/campaigns", {
        headers: { "auth-token": token },
      });
      setCampaigns(res.data);

      // Update stats
      const totalCampaigns = res.data.length;
      const activeCampaigns = res.data.filter(c => c.status === "Active").length;
      const totalDonations = res.data.reduce((sum, c) => sum + (c.donations?.length || 0), 0);
      const totalFunds = res.data.reduce((sum, c) => sum + (c.raised || 0), 0);

      setStats({ totalCampaigns, activeCampaigns, totalDonations, totalFunds });
    } catch (err) {
      console.error("❌ Error fetching campaigns:", err.response?.data || err.message);
      toast.error("Error fetching campaigns");
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.beneficiary || !form.goal) {
      toast.warn("Please fill required fields!");
      return;
    }

    try {
      const payload = {
        ...form,
        goal: Number(form.goal),
        raised: editingId ? form.raised : 0,
        status: form.raised < form.goal ? "Active" : "Completed",
      };

      if (editingId) {
        await axios.put(`https://onlinedonation.onrender.com/api/admin/campaigns/${editingId}`, payload, {
          headers: { "auth-token": token },
        });
        toast.success("Campaign updated successfully");
      } else {
        await axios.post("http://localhost:8080/api/admin/campaigns", payload, {
          headers: { "auth-token": token },
        });
        toast.success("Campaign created successfully");
      }

      setForm({ name: "", beneficiary: "", goal: "", raised: 0, description: "", impact: "" });
      setEditingId(null);
      setShowModal(false);
      fetchCampaigns();
    } catch (err) {
      console.error("❌ Failed to save campaign:", err.response?.data || err.message);
      toast.error("Failed to save campaign");
    }
  };

  const handleEdit = (campaign) => {
    setForm({
      name: campaign.name,
      beneficiary: campaign.beneficiary,
      goal: campaign.goal,
      raised: campaign.raised,
      description: campaign.description || "",
      impact: campaign.impact || "",
    });
    setEditingId(campaign.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await axios.delete(`https://onlinedonation.onrender.com/api/admin/campaigns/${id}`, {
        headers: { "auth-token": token },
      });
      toast.success("Campaign deleted successfully");
      fetchCampaigns();
    } catch (err) {
      console.error("❌ Failed to delete campaign:", err.response?.data || err.message);
      toast.error("Failed to delete campaign");
    }
  };

  const toggleStatus = async (campaign) => {
    try {
      const updatedStatus = campaign.status === "Active" ? "Inactive" : "Active";
      await axios.put(
        `https://onlinedonation.onrender.com/api/admin/campaigns/${campaign.id}/status`,
        { status: updatedStatus },
        { headers: { "auth-token": token } }
      );
      toast.success(`Campaign ${updatedStatus}`);
      fetchCampaigns();
    } catch (err) {
      console.error("❌ Failed to toggle status:", err.response?.data || err.message);
      toast.error("Failed to toggle status");
    }
  };

  const getProgress = (raised, goal) => Math.min((raised / goal) * 100, 100);

  return (
    <div className="plans-page">
      {/* Header */}
      <div className="plans-header">
        <h2>Campaign Management</h2>
        <button className="create-btn" onClick={() => setShowModal(true)}>
          + Create Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="plans-stats">
        <div className="stat-card">📦 <p>Total Campaigns</p><h3>{stats.totalCampaigns}</h3></div>
        <div className="stat-card active">✅ <p>Active Campaigns</p><h3>{stats.activeCampaigns}</h3></div>
        <div className="stat-card">💰 <p>Total Donations</p><h3>{stats.totalDonations}</h3></div>
        <div className="stat-card revenue">💸 <p>Total Funds Raised</p><h3>₹{stats.totalFunds.toLocaleString()}</h3></div>
      </div>

      {/* Campaigns Grid */}
      <div className="plans-grid">
        {campaigns.length > 0 ? (
          campaigns.map((c) => (
            <div key={c.id} className="plan-card">
              <div className="plan-card-top">
                <h3>{c.name}</h3>
                <p><b>Beneficiary:</b> {c.beneficiary}</p>
                <p><b>Status:</b> {c.status}</p>
                <h2 className="plan-price">
                  Raised: ₹{c.raised.toLocaleString()} / Goal: ₹{c.goal.toLocaleString()}
                </h2>
              </div>
              <div className="plan-card-bottom">
                <p className="plan-desc">{c.description}</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${getProgress(c.raised, c.goal)}%` }}></div>
                </div>
                <div className="plan-actions">
                  <button className="edit-btn" onClick={() => handleEdit(c)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(c.id)}>Delete</button>
                  <button className="details-btn" onClick={() => setSelectedCampaign(c)}>View Details</button>
                  <button className="submit-btn" onClick={() => toggleStatus(c)}>
                    {c.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No campaigns available</p>
        )}
      </div>

      {/* Details Modal */}
      {selectedCampaign && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedCampaign.name}</h3>
              <button onClick={() => setSelectedCampaign(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p><b>Beneficiary:</b> {selectedCampaign.beneficiary}</p>
              <p><b>Goal:</b> ₹{selectedCampaign.goal.toLocaleString()}</p>
              <p><b>Raised:</b> ₹{selectedCampaign.raised.toLocaleString()}</p>
              <p><b>Impact:</b> {selectedCampaign.impact}</p>
              <p className="plan-desc">{selectedCampaign.description}</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${getProgress(selectedCampaign.raised, selectedCampaign.goal)}%` }}></div>
              </div>

              {/* Donation History */}
              {selectedCampaign.donations?.length > 0 && (
                <div className="donation-history">
                  <h4>Recent Donations:</h4>
                  <ul>
                    {selectedCampaign.donations.map((donation, i) => (
                      <li key={i}>{donation.donorName} - ₹{donation.amount.toLocaleString()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setSelectedCampaign(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingId ? "Edit Campaign" : "Create Campaign"}</h3>
              <button onClick={() => { setShowModal(false); setEditingId(null); }}>&times;</button>
            </div>
            <form className="plan-form" onSubmit={handleSubmit}>
  <div className="form-row">
    <div>
      <label>Campaign Name</label>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="e.g. Feed the Needy"
        required
      />
    </div>

    <div>
      <label>Beneficiary</label>
      <input
        name="beneficiary"
        value={form.beneficiary}
        onChange={handleChange}
        placeholder="e.g. Local NGO"
        required
      />
    </div>
  </div>

  <label>Goal Amount</label>
  <input
    name="goal"
    type="number"
    value={form.goal}
    onChange={handleChange}
    placeholder="e.g. 100000"
    required
  />

  <label>Description</label>
  <textarea
    name="description"
    value={form.description}
    onChange={handleChange}
    placeholder="Brief about the campaign"
  ></textarea>

  <label>Impact</label>
  <textarea
    name="impact"
    value={form.impact}
    onChange={handleChange}
    placeholder="What impact will this have?"
  ></textarea>

  <div className="form-actions">
    <button
      type="button"
      className="cancel-btn"
      onClick={() => {
        setShowModal(false);
        setEditingId(null);
      }}
    >
      Cancel
    </button>
    <button type="submit" className="submit-btn">
      {editingId ? "Update" : "Create"}
    </button>
  </div>
</form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Campaigns;
