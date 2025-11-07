import React, { useEffect, useState } from "react";
import axios from "axios";
import "../CSS/AdminPartnerManagement.css";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const API_BASE = "http://localhost:8080/api";

const AdminPartnerManagement = () => {
  const [partners, setPartners] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [assignCampaignId, setAssignCampaignId] = useState("");

  useEffect(() => {
    fetchPartners();
    fetchCampaigns();
  }, []);

  // Fetch partners
  const fetchPartners = async () => {
    try {
      const res = await axios.get(`${API_BASE}/partners/all`);
      setPartners(res.data);
    } catch (err) {
      console.error("Error fetching partners:", err);
      alert("❌ Failed to fetch partners");
    } finally {
      setLoading(false);
    }
  };

  // Fetch campaigns
  const fetchCampaigns = async () => {
  try {
    const token = localStorage.getItem("token"); // add token
    const res = await axios.get("http://localhost:8080/api/admin/campaigns", {
      headers: { "auth-token": token },
    });
    setCampaigns(res.data);
  } catch (err) {
    console.error("Error fetching campaigns:", err);
  }
};


  // Delete partner
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this partner?")) return;
    try {
      await axios.delete(`${API_BASE}/partners/${id}`);
      alert("✅ Partner removed successfully!");
      fetchPartners();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete partner");
    }
  };

  // Change partner status
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(
        `${API_BASE}/partners/${id}/status`,
        { status: newStatus }, // send object instead of string
        { headers: { "Content-Type": "application/json" } }
      );
      alert(`✅ Partner ${newStatus.toLowerCase()} successfully!`);
      fetchPartners();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update partner status");
    }
  };

  // Assign campaign
  const handleAssignCampaign = async () => {
    if (!assignCampaignId || !selectedPartner) return;
    try {
      await axios.put(
        `${API_BASE}/partners/${selectedPartner.id}/assign/${Number(assignCampaignId)}`
      );
      alert("✅ Campaign assigned successfully!");
      setSelectedPartner(null);
      setAssignCampaignId("");
      fetchPartners();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to assign campaign");
    }
  };

  // Filter partners based on search and status
  const filtered = partners.filter((p) => {
    const matchesSearch =
      p.organizationName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Summary counts
  const total = partners.length;
  const pending = partners.filter((p) => p.status === "PENDING").length;
  const approved = partners.filter((p) => p.status === "APPROVED").length;
  const rejected = partners.filter((p) => p.status === "REJECTED").length;

  return (
    <div className="admin-partner-page">
      <h1>🤝 Partner Management</h1>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">Total <span>{total}</span></div>
        <div className="card">Pending <span>{pending}</span></div>
        <div className="card">Approved <span>{approved}</span></div>
        <div className="card">Rejected <span>{rejected}</span></div>
      </div>

      {/* Search & Refresh */}
      <div className="search-sort-container">
        <input
          type="text"
          placeholder="Search partner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchPartners}>🔄 Refresh</button>
      </div>

      {/* Status filter */}
      <div className="status-filter-buttons">
        {["All", "PENDING", "APPROVED", "REJECTED"].map((status) => (
          <button
            key={status}
            className={statusFilter === status ? "active" : ""}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button onClick={() => exportToExcel(filtered, "partners.xlsx")}>📊 Export Excel</button>
        <button
          onClick={() =>
            exportToPDF(
              filtered,
              ["id", "organizationName", "email", "contactPerson", "status"],
              "partners.pdf"
            )
          }
        >
          📄 Export PDF
        </button>
      </div>

      {/* Partner Table */}
      {loading ? (
        <p>Loading partners...</p>
      ) : filtered.length === 0 ? (
        <p className="no-partners">No partners found.</p>
      ) : (
        <div className="table-container">
          <table className="partner-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Organization</th>
                <th>Contact</th>
                <th>Email</th>
                <th>City</th>
                <th>Status</th>
                <th>Logo</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.organizationName}</td>
                  <td>{p.contactPerson}</td>
                  <td>{p.email}</td>
                  <td>{p.city}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        p.status === "APPROVED"
                          ? "green"
                          : p.status === "REJECTED"
                          ? "red"
                          : "yellow"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {p.logo ? (
                      <img src={p.logo} alt="logo" className="partner-logo-preview" />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <button onClick={() => setSelectedPartner(p)}>👁 View</button>
                    <button className="delete-btn" onClick={() => handleDelete(p.id)}>🗑</button>
                    {p.status !== "APPROVED" && (
                      <button className="approve-btn" onClick={() => handleStatusChange(p.id, "APPROVED")}>✅</button>
                    )}
                    {p.status !== "REJECTED" && (
                      <button className="reject-btn" onClick={() => handleStatusChange(p.id, "REJECTED")}>❌</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Partner Modal */}
      {selectedPartner && (
        <div className="modal-overlay" onClick={() => setSelectedPartner(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedPartner.organizationName}</h2>
            {selectedPartner.logo && (
              <img src={selectedPartner.logo} alt="Logo" className="partner-logo-large" />
            )}
            <p><strong>Contact Person:</strong> {selectedPartner.contactPerson}</p>
            <p><strong>Email:</strong> {selectedPartner.email}</p>
            <p><strong>Phone:</strong> {selectedPartner.phone}</p>
            <p><strong>City:</strong> {selectedPartner.city}</p>
            <p><strong>Status:</strong> {selectedPartner.status}</p>
            <p><strong>Message:</strong> {selectedPartner.message || "-"}</p>

            {/* Assign Campaign Section */}
            {selectedPartner.status === "APPROVED" && (
              <div className="assign-campaign-section">
                <h3>Assign Campaign</h3>
                <select
                  value={assignCampaignId}
                  onChange={(e) => setAssignCampaignId(e.target.value)}
                >
                  <option value="">-- Select Campaign --</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button onClick={handleAssignCampaign}>Assign</button>
              </div>
            )}

            <button onClick={() => setSelectedPartner(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPartnerManagement;
