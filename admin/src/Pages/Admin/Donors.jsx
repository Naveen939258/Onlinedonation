import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../CSS/Donors.css";
import { FaUser, FaEnvelope, FaPhone, FaToggleOn } from "react-icons/fa";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const Donors = () => {
  const [donors, setDonors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("All"); // ✅ New filter state
  const [editDonor, setEditDonor] = useState(null);
  const [newDonorModal, setNewDonorModal] = useState(false);

  const token = localStorage.getItem("token");

  // ✅ Fetch donors
  const fetchDonors = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/donors", {
        headers: { "auth-token": token },
      });
      setDonors(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("❌ Error fetching donors:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  // ✅ Search + Status Filter
  useEffect(() => {
    let result = donors.filter((d) =>
      d.username?.toLowerCase().includes(search.toLowerCase())
    );

    if (statusFilter === "Verified") {
      result = result.filter((d) => d.verified && !d.blocked);
    } else if (statusFilter === "Blocked") {
      result = result.filter((d) => d.blocked);
    } else if (statusFilter === "Unverified") {
      result = result.filter((d) => !d.verified && !d.blocked);
    }

    setFiltered(result);
  }, [search, donors, statusFilter]);

  // ✅ Sort
  const handleSort = () => {
    const sorted = [...filtered].sort((a, b) =>
      sortOrder === "asc"
        ? a.username.localeCompare(b.username)
        : b.username.localeCompare(a.username)
    );
    setFiltered(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // ✅ Block / Unblock
  const handleBlock = async (id) => {
    console.log("🟠 Block clicked for donor:", id);
    try {
      const res = await axios.patch(
        `http://localhost:8080/api/admin/donors/${id}/block`,
        {},
        { headers: { "auth-token": token } }
      );
      console.log("✅ Block/Unblock response:", res.data);
      fetchDonors();
    } catch (err) {
      console.error("❌ Block/Unblock failed:", err.response?.data || err.message);
    }
  };

  // ✅ Verify / Unverify
  const handleVerify = async (id) => {
    console.log("🟢 Verify clicked for donor:", id);
    try {
      const res = await axios.patch(
        `http://localhost:8080/api/admin/donors/${id}/verify`,
        {},
        { headers: { "auth-token": token } }
      );
      console.log("✅ Verify response:", res.data);
      fetchDonors();
    } catch (err) {
      console.error("❌ Verify failed:", err.response?.data || err.message);
    }
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donor?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/donors/${id}`, {
        headers: { "auth-token": token },
      });
      fetchDonors();
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  // ✅ Update
  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin/donors/${editDonor.id}`,
        {
          username: editDonor.username,
          email: editDonor.email,
          phone: editDonor.phone,
        },
        { headers: { "auth-token": token } }
      );
      setEditDonor(null);
      fetchDonors();
    } catch (err) {
      console.error("❌ Update failed:", err);
    }
  };

  // ✅ Create
  const handleCreate = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/admin/donors",
        {
          username: editDonor.username,
          email: editDonor.email,
          phone: editDonor.phone,
          password: editDonor.password || "default123",
        },
        { headers: { "auth-token": token } }
      );
      setNewDonorModal(false);
      setEditDonor(null);
      fetchDonors();
    } catch (err) {
      console.error("❌ Create failed:", err);
    }
  };

  // ✅ Stats
  const totalDonors = donors.length;
  const verifiedDonors = donors.filter((d) => d.verified).length;
  const blockedDonors = donors.filter((d) => d.blocked).length;

  return (
    <div className="donors-page">
      {/* Summary */}
      <div className="summary-cards">
        <div className="card">
          Total Donors <span>{totalDonors}</span>
        </div>
        <div className="card">
          Verified <span>{verifiedDonors}</span>
        </div>
        <div className="card">
          Blocked <span>{blockedDonors}</span>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="search-sort-container">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSort}>
          Sort {sortOrder === "asc" ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* ✅ Status Filter Buttons */}
      <div className="status-filter-buttons">
        {["All", "Verified", "Unverified", "Blocked"].map((status) => (
          <button
            key={status}
            className={statusFilter === status ? "active" : ""}
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Directory */}
      <div className="directory-header">
        <h3>Donors Directory</h3>
        <div>
          <button
            onClick={() => {
              setEditDonor({
                username: "",
                email: "",
                phone: "",
                password: "",
              });
              setNewDonorModal(true);
            }}
          >
            ➕ Add Donor
          </button>
          <button onClick={fetchDonors}>🔄 Refresh</button>
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
      </div>

      {/* Table */}
      <div className="donor-table-container">
        {filtered.length > 0 ? (
          <table className="donor-table">
            <thead>
              <tr>
                <th><FaUser /> Name</th>
                <th><FaEnvelope /> Email</th>
                <th><FaToggleOn /> Status</th>
                <th><FaPhone /> Phone</th>
                <th>⚙ Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>{d.username}</td>
                  <td>{d.email}</td>
                  <td className={d.blocked ? "inactive" : "active"}>
                    {d.blocked
                      ? "Blocked"
                      : d.verified
                      ? "Verified"
                      : "Unverified"}
                  </td>
                  <td>{d.phone || "-"}</td>
                  <td>
                    <button onClick={() => setEditDonor(d)}>✏ Edit</button>
                    <button onClick={() => handleBlock(d.id)}>
                      {d.blocked ? "Unblock" : "Block"}
                    </button>
                    <button onClick={() => handleVerify(d.id)}>
                      {d.verified ? "Unverify" : "Verify"}
                    </button>
                    <button onClick={() => handleDelete(d.id)}>🗑 Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-donors">No donors found</p>
        )}
      </div>

      {/* Modal */}
      {editDonor && (
        <div className="modal1">
          <div className="modal-content">
            <h3>{newDonorModal ? "Add Donor" : "Edit Donor"}</h3>
            <input
              type="text"
              placeholder="Name"
              value={editDonor.username}
              onChange={(e) =>
                setEditDonor({ ...editDonor, username: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              value={editDonor.email}
              onChange={(e) =>
                setEditDonor({ ...editDonor, email: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Phone"
              value={editDonor.phone || ""}
              onChange={(e) =>
                setEditDonor({ ...editDonor, phone: e.target.value })
              }
            />
            {newDonorModal && (
              <input
                type="password"
                placeholder="Password"
                value={editDonor.password || ""}
                onChange={(e) =>
                  setEditDonor({ ...editDonor, password: e.target.value })
                }
              />
            )}
            <div className="modal-actions">
              <button
                onClick={() => {
                  setEditDonor(null);
                  setNewDonorModal(false);
                }}
              >
                Cancel
              </button>
              <button
                onClick={newDonorModal ? handleCreate : handleUpdate}
                className="save-btn"
              >
                {newDonorModal ? "Add Donor" : "Update Donor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donors;
