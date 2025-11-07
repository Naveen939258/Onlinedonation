/* eslint-disable */
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/Events.css";

const API_BASE = "http://localhost:8080/api";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxzumlzrv/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "donation_preset";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [joined, setJoined] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [filters, setFilters] = useState({ type: "", city: "", month: "" });
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [members, setMembers] = useState(1);
  const [stats, setStats] = useState({ total: 0, joined: 0, upcoming: 0 });
  const [cities, setCities] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);

  // Gallery modal state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryEvent, setGalleryEvent] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Reminder modal state
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderEventId, setReminderEventId] = useState(null);
  const [reminderHours, setReminderHours] = useState(24);
  const [reminderSaving, setReminderSaving] = useState(false);

  const token = localStorage.getItem("token");

  const isJoined = (id) => joined.includes(id);

  // Fetch all events
  useEffect(() => {
    fetchEvents();
    fetchPastEvents();
    if (token) fetchJoined();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPastEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/events/past`);
      setPastEvents(res.data);
    } catch (err) {
      console.error("Error fetching past events:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/events`);
      const sorted = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(sorted);

      const upcoming = sorted.filter((e) => new Date(e.date) >= new Date());
      setNextEvent(upcoming[0] || null);

      const uniqueCities = Array.from(new Set(res.data.map(e => e.location || "").filter(Boolean)));
      setCities(uniqueCities);

      setStats(prev => ({
        total: sorted.length,
        joined: prev.joined || 0,
        upcoming: upcoming.length,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoined = async () => {
    try {
      const res = await axios.get(`${API_BASE}/user/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedJoined = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setJoined(sortedJoined.map((j) => j.eventId));
      setJoinedEvents(sortedJoined);
      setStats(prev => ({ ...prev, joined: sortedJoined.length }));
    } catch (err) {
      console.error(err);
    }
  };

  // Countdown for next event
  useEffect(() => {
    if (!nextEvent) return;
    const interval = setInterval(() => {
      const diff = new Date(nextEvent.date) - new Date();
      if (diff <= 0) {
        setCountdown("Event is live!");
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setCountdown(`${days}d ${hours}h ${minutes}m left`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextEvent]);

  const handleJoin = (id) => {
    if (!token) {
      alert("⚠️ Please login to join events!");
      return;
    }
    setSelectedEventId(id);
    setShowModal(true);
  };

  const submitJoin = async () => {
    try {
      setJoining(selectedEventId);
      await axios.post(
        `${API_BASE}/events/${selectedEventId}/join`,
        { members: parseInt(members) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Joined successfully!");
      await fetchJoined();
      await fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || "❌ Failed to join.");
    } finally {
      setJoining(null);
      setShowModal(false);
      setMembers(1);
    }
  };

  // Reminders: open modal
  const openReminderModal = (eventId) => {
    if (!token) {
      alert("⚠️ Please login to set reminders.");
      return;
    }
    // allow only if user joined
    if (!isJoined(eventId)) {
      alert("⚠️ You must join the event to set reminders.");
      return;
    }
    setReminderEventId(eventId);
    setReminderHours(24);
    setReminderOpen(true);
  };

  const submitSetReminder = async () => {
    if (!reminderEventId) return;
    try {
      setReminderSaving(true);
      await axios.post(
        `${API_BASE}/events/${reminderEventId}/reminder`,
        { hoursBefore: reminderHours },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ Reminder set ${reminderHours} hours before event`);
      setReminderOpen(false);
    } catch (err) {
      console.error("Failed to set reminder:", err);
      alert(err.response?.data?.message || "Failed to set reminder");
    } finally {
      setReminderSaving(false);
    }
  };

  // Download certificate for a past attended event
  const downloadCertificate = async (eventId) => {
    if (!token) {
      alert("⚠️ Please login to download certificate.");
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/events/${eventId}/certificate`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "arraybuffer",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-event-${eventId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Certificate download failed:", err);
      alert(err.response?.data?.message || "Failed to download certificate");
    }
  };

  if (loading) return <div className="events-page"><h2>Loading events...</h2></div>;

  // Filters
  const filteredEvents = events.filter((e) => {
    const matchesType = filters.type ? e.type === filters.type : true;
    const matchesCity = filters.city ? (e.location || "").toLowerCase() === filters.city.toLowerCase() : true;
    const matchesMonth = filters.month
      ? new Date(e.date).toLocaleString("en-US", { month: "long" }) === filters.month
      : true;
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch = !normalizedSearch || (
      (e.title || "").toLowerCase().includes(normalizedSearch) ||
      (e.location || "").toLowerCase().includes(normalizedSearch) ||
      (e.description || "").toLowerCase().includes(normalizedSearch) ||
      (e.organizer || "").toLowerCase().includes(normalizedSearch)
    );
    return matchesType && matchesCity && matchesMonth && matchesSearch;
  });

  const today = new Date();
  const myUpcoming = joinedEvents.filter((e) => new Date(e.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
  const myPast = joinedEvents.filter((e) => new Date(e.date) < today).sort((a, b) => new Date(b.date) - new Date(a.date));
  const pastNotJoined = pastEvents
    .filter(e => !isJoined(e.id))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const groupedEvents = {};
  filteredEvents.forEach((e) => {
    const month = new Date(e.date).toLocaleString("en-US", { month: "long", year: "numeric" });
    if (!groupedEvents[month]) groupedEvents[month] = [];
    groupedEvents[month].push(e);
  });

  const getGoogleCalendarLink = (event) => {
    const start = new Date(event.date).toISOString().replace(/-|:|\.\d+/g, "");
    const end = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${start}/${end}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(
      event.location || ""
    )}&sf=true&output=xml`;
  };

  const openGallery = (event) => {
    setGalleryEvent(event);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setGalleryEvent(null);
  };

  // Check if user can upload photo for this event
  const canUploadForEvent = (event) => {
    if (!event) return false;
    const token = localStorage.getItem("token");
    return token && new Date(event.date) < new Date() && isJoined(event.id || event.eventId);
  };

  // Handle file upload to Cloudinary and save to event gallery
  const handleFileChange = async (file) => {
    const token = localStorage.getItem("token"); // always get fresh token
    if (!file || !galleryEvent || !token) return alert("⚠️ Please login to upload photos");

    try {
      setUploading(true);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const cloudRes = await axios.post(CLOUDINARY_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = cloudRes.data.secure_url;
      if (!imageUrl) throw new Error("Cloudinary upload failed");

      // Send image URL to backend
      await axios.post(
        `${API_BASE}/events/${galleryEvent.id}/gallery`,
        { url: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh events and joined events to update gallery
      await fetchEvents();
      await fetchJoined();

      alert("✅ Photo uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="events-page">
      {/* Hero */}
      {nextEvent && (
        <section className="events-hero">
          <div className="hero-left">
            <h1>🌟 Next Big Event: {nextEvent.title}</h1>
            <p>
              <b>Date:</b> {new Date(nextEvent.date).toLocaleDateString()} <br />
            </p>
          </div>
          <div className="hero-right">
            <h3>Countdown</h3>
            <p>{countdown}</p>
          </div>
        </section>
      )}

      {/* Stats Panel */}
      <section className="stats-panel">
        <div className="stat-card"><p>📅 Total Events</p><h3>{stats.total}</h3></div>
        <div className="stat-card"><p>Joined Events</p><h3>{stats.joined}</h3></div>
        <div className="stat-card"><p>Upcoming Events</p><h3>{stats.upcoming}</h3></div>
      </section>

      {/* Filters */}
      <section className="events-filters">
        <input type="text" placeholder="Search by title/desc/organizer" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="Community">Community</option>
          <option value="Health">Health</option>
          <option value="Education">Education</option>
        </select>
        <select value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
          <option value="">All Months</option>
          {Array.from(new Set(events.map(e => new Date(e.date).toLocaleString("en-US", { month: "long" })))).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
          <option value="">All Cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </section>

      <div className="events-main">
        <div className="events-left">
          {/* Grouped events */}
          {Object.keys(groupedEvents).map((month) => (
            <section key={month}>
              <h2>{month}</h2>
              <div className="events-list">
                {groupedEvents[month].map((e) => (
                  <div key={e.id} className="event-card">
                    <img src={e.imageUrl || "https://cdn-icons-png.flaticon.com/512/3209/3209275.png"} alt={e.title} className="event-img" />
                    <div className="event-details">
                      <h3>{e.title}</h3>
                      <p><b>Date:</b> {e.date}</p>
                      <p><b>Location:</b> {e.location}</p>
                      <p><b>Type:</b> {e.type}</p>
                      <p className="event-desc">{e.description}</p>
                      <p>👥 <b>Participants:</b> {e.participants}</p>
                      <iframe title={`map-${e.id}`} width="100%" height="150" frameBorder="0" style={{ border: 0, marginTop: 8, borderRadius: 10 }} src={`https://www.google.com/maps?q=${encodeURIComponent(e.location || "")}&output=embed`} allowFullScreen></iframe>

                      {isJoined(e.id) && (
                        <div className="event-actions">
                          <a href={getGoogleCalendarLink(e)} target="_blank" rel="noreferrer" className="calendar-btn">Add to Google Calendar</a>
                          <button className="reminder-btn" onClick={() => openReminderModal(e.id)}>Set Reminder</button>
                        </div>
                      )}

                      {(!isJoined(e.id) && e.gallery && e.gallery.length > 0) && (
                        <div style={{ marginTop: 8 }}>
                          <button className="gallery-btn" onClick={() => openGallery(e)}>View Gallery</button>
                        </div>
                      )}
                    </div>

                    <button onClick={() => handleJoin(e.id)} disabled={joining === e.id || isJoined(e.id)} className={isJoined(e.id) ? "joined-btn" : "join-btn"}>
                      {isJoined(e.id) ? "✅ Joined" : joining === e.id ? "Joining..." : "Join Now"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Past events attended */}
          {myPast.length > 0 && (
            <section>
              <h2>Past Events You Attended</h2>
              <div className="events-list">
                {myPast.map((e) => {
                  // Normalize event object: ensure `id` exists
                  const event = { ...e, id: e.id || e.eventId };

                  return (
                    <div key={event.id} className="event-card">
                      <img
                        src={event.imageUrl || "https://cdn-icons-png.flaticon.com/512/3209/3209275.png"}
                        alt={event.title}
                        className="event-img"
                      />
                      <div className="event-details">
                        <h3>{event.title}</h3>
                        <p><b>Date:</b> {event.date}</p>

                        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                          <button className="gallery-btn" onClick={() => openGallery(event)}>
                            Open Gallery
                          </button>
                          <button className="join-btn" onClick={() => downloadCertificate(event.eventId || event.id)}>
                            Download Certificate
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Past events not attended */}
          {pastNotJoined.length > 0 && (
            <section>
              <h2>Past Events You Did Not Attend</h2>
              <div className="events-list">
                {pastNotJoined.map((e) => (
                  <div key={e.id} className="event-card">
                    <img src={e.imageUrl || "https://cdn-icons-png.flaticon.com/512/3209/3209275.png"} alt={e.title} className="event-img" />
                    <div className="event-details">
                      <h3>{e.title}</h3>
                      <p><b>Date:</b> {e.date}</p>
                      <div style={{ marginTop: 8 }}>
                        <button className="gallery-btn" onClick={() => openGallery(e)}>View Gallery</button>
                        <p style={{ fontSize: 13, color: "#cbd5e1" }}>You did not attend this event</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Sidebar */}
        <div className="events-right">
          {myUpcoming.length > 0 && (
            <section>
              <h2>Upcoming Events You Joined</h2>
              <div className="events-list sidebar-list">
                {myUpcoming.map((e) => (
                  <div key={e.eventId} className="event-card sidebar-card">
                    <img src={e.imageUrl || "https://cdn-icons-png.flaticon.com/512/3209/3209275.png"} alt={e.title} className="event-img" />
                    <div className="event-details">
                      <h3>{e.title}</h3>
                      <p><b>Date:</b> {e.date}</p>
                      <div className="event-actions">
                        <a href={getGoogleCalendarLink(e)} target="_blank" rel="noreferrer" className="calendar-btn">Google Calendar</a>
                        <button className="reminder-btn" onClick={() => openReminderModal(e.eventId)}>Set Reminder</button>
                      </div>
                    </div>
                    <button disabled className="joined-btn">✅ Joined</button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Join Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Join Event</h3>
            <p>Number of Members:</p>
            <input type="number" min={1} value={members} onChange={(e) => setMembers(e.target.value)} />
            <button onClick={submitJoin} disabled={joining}>Join</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {reminderOpen && (
        <div className="modal-overlay" onClick={() => setReminderOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Set WhatsApp Reminder</h3>
            <p>Select when you'd like to be reminded:</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
              <button className={reminderHours === 24 ? "join-btn" : "submit-btn"} onClick={() => setReminderHours(24)}>24 hours</button>
              <button className={reminderHours === 5 ? "join-btn" : "submit-btn"} onClick={() => setReminderHours(5)}>5 hours</button>
              <button className={reminderHours === 1 ? "join-btn" : "submit-btn"} onClick={() => setReminderHours(1)}>1 hour</button>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={submitSetReminder} disabled={reminderSaving} className="join-btn">{reminderSaving ? "Saving..." : "Save Reminder"}</button>
              <button onClick={() => setReminderOpen(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {galleryOpen && galleryEvent && (
        <div className="modal-overlay" onClick={closeGallery}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{galleryEvent.title} Gallery</h3>
            <div className="gallery-images">
              {galleryEvent.gallery && galleryEvent.gallery.length > 0
                ? galleryEvent.gallery.map((img, idx) => <img key={idx} src={img.url} alt={`gallery-${idx}`} />)
                : <p>No images yet</p>}
            </div>
            <br />

            {canUploadForEvent(galleryEvent) && (
              <label className="upload-label">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(ev) => handleFileChange(ev.target.files?.[0])}
                />
              </label>
            )}

            {uploading && <p>Uploading...</p>}
            <button onClick={closeGallery}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Events;
