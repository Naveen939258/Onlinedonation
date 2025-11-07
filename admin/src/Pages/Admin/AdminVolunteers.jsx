import React, { useEffect, useState } from "react";
import axios from "axios";
import "../CSS/AdminVolunteers.css";
import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

const API_BASE = "http://localhost:8080/api";

const AdminVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [taskInput, setTaskInput] = useState({});
  const [multiTaskInput, setMultiTaskInput] = useState({});
  const [selectedVolunteer, setSelectedVolunteer] = useState(null); // For modal

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/volunteers/all`);
      setVolunteers(res.data);
    } catch (err) {
      console.error("Error fetching volunteers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this volunteer?")) return;
    try {
      await axios.delete(`${API_BASE}/volunteers/${id}`);
      alert("Volunteer removed successfully!");
      fetchVolunteers();
    } catch {
      alert("Failed to delete volunteer");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE}/volunteers/${id}/status`, { status: newStatus });
      fetchVolunteers();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleTaskAssign = async (id) => {
    const assignedTask = taskInput[id];
    if (!assignedTask?.trim()) return alert("Please enter a task before assigning.");
    try {
      const vol = volunteers.find((v) => v.id === id);
      const existingTasks = vol?.tasks || [];
      const updatedTasks = [...existingTasks, { name: assignedTask, completed: false }];
      await axios.put(`${API_BASE}/volunteers/${id}/tasks`, updatedTasks);
      alert("Task assigned successfully!");
      fetchVolunteers();
      setTaskInput({ ...taskInput, [id]: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to assign task");
    }
  };

  const handleMultiTaskAssign = async (id) => {
    const tasksStr = multiTaskInput[id];
    if (!tasksStr?.trim()) return alert("Please enter tasks separated by commas.");
    const newTasks = tasksStr.split(",").map((t) => ({ name: t.trim(), completed: false }));
    try {
      const vol = volunteers.find((v) => v.id === id);
      const existingTasks = vol?.tasks || [];
      const updatedTasks = [...existingTasks, ...newTasks];
      await axios.put(`${API_BASE}/volunteers/${id}/tasks`, updatedTasks);
      alert("Multiple tasks assigned successfully!");
      fetchVolunteers();
      setMultiTaskInput({ ...multiTaskInput, [id]: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to assign tasks");
    }
  };

  const handleAllowResubmit = async (id) => {
    try {
      await axios.put(`${API_BASE}/volunteers/${id}/allow-resubmit`, { allowResubmit: true });
      alert("Resubmission allowed!");
      fetchVolunteers();
    } catch {
      alert("Failed to allow resubmission.");
    }
  };

  const markTaskCompleted = async (volId, taskName) => {
    try {
      await axios.put(`${API_BASE}/volunteers/${volId}/task/completed`, { taskName });
      fetchVolunteers();
    } catch {
      alert("Failed to mark task completed.");
    }
  };

  const filtered = volunteers.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = volunteers.length;
  const pending = volunteers.filter((v) => v.status === "Pending").length;
  const approved = volunteers.filter((v) => v.status === "Approved").length;
  const rejected = volunteers.filter((v) => v.status === "Rejected").length;

  return (
    <div className="admin-volunteer-page">
      <h1>👥 Volunteer Management</h1>

      {/* Summary */}
      <div className="summary-cards">
        <div className="card">Total <span>{total}</span></div>
        <div className="card">Pending <span>{pending}</span></div>
        <div className="card">Approved <span>{approved}</span></div>
        <div className="card">Rejected <span>{rejected}</span></div>
      </div>

      {/* Search & Filters */}
      <div className="search-sort-container">
        <input
          type="text"
          placeholder="Search volunteer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchVolunteers}>🔄 Refresh</button>
      </div>
      <div className="status-filter-buttons">
        {["All", "Pending", "Approved", "Rejected"].map((status) => (
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

      {/* Volunteers Table */}
      {loading ? (
        <p>Loading volunteers...</p>
      ) : filtered.length === 0 ? (
        <p className="no-volunteers">No volunteers found.</p>
      ) : (
        <div className="table-container">
          <table className="volunteer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Tasks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.name}</td>
                  <td>{v.email}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        v.status === "Approved" ? "green" :
                        v.status === "Rejected" ? "red" : "yellow"
                      }`}
                    >
                      {v.status}
                    </span>
                    {v.allowResubmit && <span className="resubmit-badge">🔄</span>}
                  </td>
                  <td>
                    {v.tasks?.length > 0 ? (
                      <div>
                        {v.tasks.map((t, idx) => (
                          <div key={idx}>
                            {t.name} {t.completed ? "✅" : ""}
                            {!t.completed && <button onClick={() => markTaskCompleted(v.id, t.name)}>Complete</button>}
                          </div>
                        ))}
                        <div className="multi-task-input">
                          <input
                            type="text"
                            placeholder="Task1, Task2..."
                            value={multiTaskInput[v.id] || ""}
                            onChange={(e) => setMultiTaskInput({ ...multiTaskInput, [v.id]: e.target.value })}
                          />
                          <button onClick={() => handleMultiTaskAssign(v.id)}>Assign Multiple</button>
                        </div>
                      </div>
                    ) : (
                      <div className="task-input-container">
                        <input
                          type="text"
                          placeholder="Assign task..."
                          value={taskInput[v.id] || ""}
                          onChange={(e) => setTaskInput({ ...taskInput, [v.id]: e.target.value })}
                        />
                        <button onClick={() => handleTaskAssign(v.id)}>📋</button>
                      </div>
                    )}
                  </td>
                  <td>
                    <button onClick={() => setSelectedVolunteer(v)}>👁 View</button>
                    <button className="delete-btn" onClick={() => handleDelete(v.id)}>🗑</button>
                    {v.status !== "Approved" && <button className="approve-btn" onClick={() => handleStatusChange(v.id, "Approved")}>✅</button>}
                    {v.status !== "Rejected" && <button className="reject-btn" onClick={() => handleStatusChange(v.id, "Rejected")}>❌</button>}
                    {!v.allowResubmit && <button onClick={() => handleAllowResubmit(v.id)}>🔄 Allow Resubmit</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Details */}
      {selectedVolunteer && (
        <div className="modal-overlay" onClick={() => setSelectedVolunteer(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedVolunteer.name} - Details</h2>
            <p><strong>Phone:</strong> {selectedVolunteer.phone}</p>
            <p><strong>City:</strong> {selectedVolunteer.city}</p>
            <p><strong>Skills:</strong> {selectedVolunteer.skills || "-"}</p>
            <p><strong>Availability:</strong> {selectedVolunteer.availability}</p>
            <p><strong>Message:</strong> {selectedVolunteer.message || "-"}</p>
            <button onClick={() => setSelectedVolunteer(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVolunteers;
