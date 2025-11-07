import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/Team.css";
import NaveenImg from "../assets/Naveen.png";

const API_BASE = "https://onlinedonation.onrender.com/api";

// --- TEAM MEMBERS ---
const teamMembers = [
  {
    name: "Naveen Kakarla",
    role: "Founder & CEO",
    img: NaveenImg,
    bio: "Visionary leader driving impactful donations and community partnerships.",
    contact: "+91 98765 43210",
  },
  {
    name: "Srujan",
    role: "Operations Head",
    img: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=800&q=80",
    bio: "Ensures smooth coordination between NGOs, donors, and volunteers.",
    contact: "+91 91234 56789",
  },
  {
    name: "Ashwin",
    role: "Technology Lead",
    img: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=800&q=80",
    bio: "Builds innovative systems to make online donations secure and easy.",
    contact: "+91 99887 66554",
  },
  {
    name: "Chandu",
    role: "Marketing Director",
    img: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=800&q=80",
    bio: "Spreads awareness and brings stories of change to the world.",
    contact: "+91 98765 12345",
  },
];

const Team = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVolunteers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/volunteers/all`);
      // Filter approved volunteers with at least one completed task
      const approved = res.data.filter(
        (v) =>
          v.status === "Approved" &&
          Array.isArray(v.tasks) &&
          v.tasks.some((t) => t.completed)
      );
      setVolunteers(approved.slice(0, 3)); // Limit to 3 volunteers
    } catch (err) {
      console.error("Failed to load volunteers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  return (
    <div className="team-page">
      {/* --- TEAM HERO --- */}
      <section className="team-hero">
        <h1>Our Team 💼</h1>
        <p>Meet the passionate individuals behind our mission of kindness.</p>
      </section>

      {/* --- TEAM GRID --- */}
      <section className="team-grid">
        {teamMembers.map((m, idx) => (
          <div className="team-card" key={idx}>
            <img src={m.img} alt={m.name} />
            <div className="team-content">
              <h3>{m.name}</h3>
              <p className="role">{m.role}</p>
              <p>{m.bio}</p>
              <p className="contact">📞 {m.contact}</p>
            </div>
          </div>
        ))}
      </section>

      {/* --- VOLUNTEER SECTION --- */}
      <section className="volunteers-section">
        <h2>🌟 Featured Volunteers</h2>
        <p>Here are some amazing volunteers actively contributing to campaigns!</p>

        {loading ? (
          <p>Loading volunteers...</p>
        ) : volunteers.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No volunteers to display right now.</p>
        ) : (
          <>
            <div className="volunteer-grid">
              {volunteers.map((v, idx) => (
                <div key={idx} className="volunteer-card">
                  <img
                    src={v.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt={v.name}
                  />
                  <div className="volunteer-content">
                    <h3>{v.name}</h3>
                    <p>{v.city || "City not provided"}</p>
                    <p className="contact">📞 {v.phone || "Not provided"}</p>
                    <p className="skills">
                      <b>Skills:</b> {v.skills || "Not specified"}
                    </p>
                    <p className="status">✅ Approved Volunteer</p>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Volunteers Button */}
            <div className="view-all-btn">
              <button onClick={() => window.location.href = "/volunteer"}>
                Become a Volunteers
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Team;
