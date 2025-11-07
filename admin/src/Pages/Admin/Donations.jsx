import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../CSS/Donations.css";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const token = localStorage.getItem("token");

  const fetchDonations = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/donations/admin/all", {
  headers: { "auth-token": token },
});
      setDonations(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("❌ Error fetching donations:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Filter by search + status
  useEffect(() => {
    let result = donations.filter(
      (d) =>
        d.donorName?.toLowerCase().includes(search.toLowerCase()) ||
        d.campaignName?.toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter !== "All") {
      result = result.filter((d) => d.status === statusFilter);
    }

    setFiltered(result);
  }, [search, donations, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(
  `http://localhost:8080/api/donations/admin/${id}/status`,
  { status: newStatus },
  { headers: { "auth-token": token } }
);
      fetchDonations();
    } catch (err) {
      console.error("❌ Failed to update status:", err);
    }
  };

  const totalDonations = donations.length;
  const totalFunds = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const pending = donations.filter((d) => d.status === "Pending").length;
  const processed = donations.filter((d) => d.status === "Processed").length;

  return (
    <div className="donations-page">
      <h2>Donation Management</h2>

      {/* Summary */}
      <div className="summary-cards">
        <div className="card">Total <span>{totalDonations}</span></div>
        <div className="card">Pending <span>{pending}</span></div>
        <div className="card">Processed <span>{processed}</span></div>
        <div className="card">Total Funds ₹<span>{totalFunds.toLocaleString()}</span></div>
      </div>

      {/* Search & Filter */}
      <div className="search-sort-container">
        <input
          type="text"
          placeholder="Search by donor or campaign..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchDonations}>🔄 Refresh</button>
      </div>

      <div className="status-filter-buttons">
        {["All", "Pending", "Processed", "Failed"].map((status) => (
          <button
            key={status}
            className={statusFilter === status ? "active" : ""}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>
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
      {/* Table */}
      <table className="donations-table">
        <thead>
          <tr>
            <th>Donor</th>
            <th>Email</th> 
            <th>Campaign</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
            <th>Payment ID</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((d) => (
            <tr key={d.id}>
              <td>{d.donorName}</td>
              <td>{d.userEmail || "-"}</td>
              <td>{d.campaignName}</td>
              <td>₹{d.amount}</td>
              <td>{new Date(d.date).toLocaleDateString()}</td>
              <td>{d.status}</td>
              <td>{d.paymentId || "-"}</td>
              <td>
                {d.status !== "Processed" && (
                  <button onClick={() => handleStatusChange(d.id, "Processed")}>
                    ✅ Mark Processed
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Donations;
