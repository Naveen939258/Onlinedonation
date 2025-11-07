import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../CSS/EventsAdmin.css";
import { toast } from "react-toastify";

const API_BASE = "https://onlinedonation.onrender.com/api";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxzumlzrv/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "donation_preset";


const EventsAdmin = () => {
  const [events, setEvents] = useState([]);
  
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
  });
  const [form, setForm] = useState({
    title: "",
    location: "",
    date: "",
    description: "",
    type: "",
    capacity: "",
    imageUrl: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [galleryModal, setGalleryModal] = useState(null); // { event, gallery }
const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("token");

  // ✅ Fetch all events
  const fetchEvents = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/events`, {
        headers: { "auth-token": token },
      });
      const all = res.data;

      // Sort events: upcoming first, past below
      const today = new Date();
      const upcoming = all
        .filter((e) => new Date(e.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      const past = all
        .filter((e) => new Date(e.date) < today)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setEvents([...upcoming, ...past]);

      const totalEvents = all.length;
      const activeEvents = all.filter((e) => e.status === "Active").length;
      const totalParticipants = all.reduce(
        (sum, e) => sum + (e.participants || 0),
        0
      );
      setStats({ totalEvents, activeEvents, totalParticipants });
    } catch {
      toast.error("Failed to fetch events");
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ✅ Input handler
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Add or edit event
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.location || !form.date)
      return toast.warn("Please fill all required fields!");

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/admin/events/${editingId}`, form, {
          headers: { "auth-token": token },
        });
        toast.success("Event updated successfully!");
      } else {
        await axios.post(`${API_BASE}/admin/events`, form, {
          headers: { "auth-token": token },
        });
        toast.success("Event created successfully!");
      }

      setForm({
        title: "",
        location: "",
        date: "",
        description: "",
        type: "",
        capacity: "",
        imageUrl: "",
      });
      setEditingId(null);
      setShowModal(false);
      fetchEvents();
    } catch {
      toast.error("Failed to save event");
    }
  };

  // ✅ Edit event
  const handleEdit = (event) => {
    setForm({
      title: event.title,
      location: event.location,
      date: event.date,
      description: event.description,
      type: event.type || "",
      capacity: event.capacity || "",
      imageUrl: event.imageUrl || "",
    });
    setEditingId(event.id);
    setShowModal(true);
  };

  // ✅ Delete event
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/events/${id}`, {
        headers: { "auth-token": token },
      });
      toast.success("Event deleted");
      fetchEvents();
    } catch {
      toast.error("Failed to delete event");
    }
  };

  // ✅ Toggle Active / Inactive
  const toggleStatus = async (event) => {
    const updated = event.status === "Active" ? "Inactive" : "Active";
    try {
      await axios.put(
        `${API_BASE}/admin/events/${event.id}/status`,
        { status: updated },
        { headers: { "auth-token": token } }
      );
      toast.success(`Event ${updated}`);
      fetchEvents();
    } catch {
      toast.error("Failed to update status");
    }
  };

  // ✅ View participants
  const viewParticipants = async (event) => {
    try {
      const res = await axios.get(
        `${API_BASE}/admin/events/${event.id}/registrations`,
        { headers: { "auth-token": token } }
      );
      setParticipants(res.data);
      setSelectedEvent(event);
    } catch {
      toast.error("Failed to fetch participants");
    }
  };
// ✅ Upload to Cloudinary and save to backend
const handleGalleryUpload = async (e, event) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const uploadRes = await axios.post(CLOUDINARY_URL, formData);
      const imageUrl = uploadRes.data.secure_url;

      await axios.post(`${API_BASE}/admin/events/${event.id}/gallery`, 
  { url: imageUrl },
  { headers: { Authorization: `Bearer ${token}` } }
);


      toast.success("✅ Photo added to gallery!");
      fetchEvents();

      setGalleryModal({
        event,
        gallery: [...(event.gallery || []), { url: imageUrl }],
      });
    } catch (err) {
      console.error(err);
      toast.error("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Delete photo
  const handleGalleryDelete = async (event, url) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/events/${event.id}/gallery`, {
  data: { url },
  headers: { Authorization: `Bearer ${token}` },
});
      toast.success("🗑️ Photo removed!");
      fetchEvents();
      setGalleryModal({
        event,
        gallery: (event.gallery || []).filter((g) => g.url !== url),
      });
    } catch (err) {
      toast.error("Failed to delete photo");
    }
  };

  const isPastEvent = (date) => new Date(date) < new Date();

  return (
    <div className="events-page">
      <div className="events-header">
        <h2>🎉 Event Management</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          ➕ Add New Event
        </button>
      </div>

      {/* ✅ Stats Section */}
      <div className="events-stats">
        <div className="stat-card">📅 Total Events<h3>{stats.totalEvents}</h3></div>
        <div className="stat-card active">✅ Active Events<h3>{stats.activeEvents}</h3></div>
        <div className="stat-card">👥 Total Participants<h3>{stats.totalParticipants}</h3></div>
      </div>

      {/* ✅ Event Cards */}
      <div className="events-grid">
        {events.length > 0 ? (
          events.map((e) => (
            <div key={e.id} className="event-card">
              <img
                src={
                  e.imageUrl ||
                  "https://cdn-icons-png.flaticon.com/512/3209/3209275.png"
                }
                alt={e.title}
                className="event-img"
              />
              <div className="event-card-header">
                <h3>{e.title}</h3>
                <p><b>Date:</b> {e.date}</p>
                <p><b>Location:</b> {e.location}</p>
                <p><b>Type:</b> {e.type}</p>
                <p><b>Status:</b> {e.status}</p>
              </div>
              <div className="event-card-body">
                <p>{e.description}</p>
                <p><b>Participants:</b> {e.participants || 0}</p>
                <div className="event-actions">
                  <button className="edit-btn" onClick={() => handleEdit(e)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(e.id)}>Delete</button>
                  <button
                    className={`status-btn ${e.status === "Active" ? "deactivate" : ""}`}
                    onClick={() => toggleStatus(e)}
                  >
                    {e.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                  <button className="details-btn" onClick={() => viewParticipants(e)}>
                    View Participants
                  </button>
                 {/* ✅ Show Manage Gallery only for past events */}
                  {isPastEvent(e.date) && (
                    <button
                      className="details-btn"
                      onClick={() => setGalleryModal({ event: e, gallery: e.gallery || [] })}
                    >
                      Manage Gallery
                    </button>
 )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-events">No events found</p>
        )}
      </div>

      {/* ✅ Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingId ? "Edit Event" : "Create Event"}</h3>
              <button onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="event-form" onSubmit={handleSubmit}>
              <label>Title</label>
              <input name="title" value={form.title} onChange={handleChange} required />
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} required />
              <label>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />
              <label>Type</label>
              <input name="type" value={form.type} onChange={handleChange} placeholder="Community / Health / Education" />
              <label>Capacity</label>
              <input name="capacity" type="number" value={form.capacity} onChange={handleChange} />
              <label>Image URL</label>
              <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}></textarea>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{editingId ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Participants Modal */}
      {selectedEvent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedEvent.title} - Participants</h3>
              <button onClick={() => setSelectedEvent(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {participants.length > 0 ? (
                <table className="participants-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p) => (
                      <tr key={p.id}>
                        <td>{p.userName || "N/A"}</td>
                        <td>{p.userEmail}</td>
                        <td>{p.phone || "N/A"}</td>
                        <td>{p.members}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No participants yet.</p>
              )}
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
       {/* ✅ Gallery Modal */}
      {galleryModal && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h3>{galleryModal.event.title} – Gallery</h3>
              <button onClick={() => setGalleryModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="upload-section">
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleGalleryUpload(e, galleryModal.event)}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                  <span className="upload-btn">
                    {uploading ? "Uploading..." : "Upload New Photo"}
                  </span>
                </label>
              </div>

              <div className="gallery-grid">
                {galleryModal.gallery && galleryModal.gallery.length > 0 ? (
                  galleryModal.gallery.map((g, idx) => (
                    <div key={idx} className="gallery-item">
                      <img src={g.url} alt="gallery" />
                      <button
                        className="delete-photo-btn"
                        onClick={() => handleGalleryDelete(galleryModal.event, g.url)}
                      >
                        🗑
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No photos uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsAdmin;
