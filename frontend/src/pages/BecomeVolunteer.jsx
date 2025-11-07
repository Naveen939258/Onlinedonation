import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CSS/BecomeVolunteer.css";

const API_BASE = "https://onlinedonation.onrender.com/api";

const SKILLS_OPTIONS = [
  "Event Management",
  "Social Media",
  "Fundraising",
  "Design",
  "Content Writing",
  "Public Speaking",
  "Photography",
  "Teaching / Tutoring",
];

const BecomeVolunteer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    skills: [],
    availability: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const skillsRef = useRef();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("⚠️ Please login to become a volunteer.");
      navigate("/login");
    } else {
      const user = JSON.parse(localStorage.getItem("user"));
      setFormData((prev) => ({
        ...prev,
        name: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [navigate, token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (skillsRef.current && !skillsRef.current.contains(e.target)) {
        setSkillsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const checkRes = await axios.get(`${API_BASE}/volunteers/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existing = checkRes.data.find((v) => v.email === formData.email);

      if (existing) {
        if (existing.allowResubmit) {
          alert("🔄 Admin requested you to update your application. Proceeding.");
        } else {
          alert(`⚠️ You are already registered. Status: ${existing.status}`);
          setStatus(`⚠️ You are already registered. Status: ${existing.status}`);
          return;
        }
      }

      const payload = { ...formData, skills: formData.skills.join(", ") };

      if (existing) {
        await axios.put(`${API_BASE}/volunteers/${existing.id}/update`, payload);
        alert("✅ Your volunteer application has been updated.");
        setStatus("✅ Your volunteer application has been updated.");
      } else {
        await axios.post(`${API_BASE}/volunteers/register`, payload);
        alert("🎉 Thank you for joining as a volunteer! Pending admin approval.");
        setStatus("✅ You are now registered. Pending admin approval.");
      }

      setFormData((prev) => ({
        ...prev,
        city: "",
        skills: [],
        availability: "",
        message: "",
      }));
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong. Please try again later.");
      setStatus("❌ Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="volunteer-page">
      <h1 className="volunteer-title">🤝 Become a Volunteer</h1>
      <p className="volunteer-subtitle">
        Join our mission! Volunteer to organize campaigns or support fundraising.
      </p>

      <form className="volunteer-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            readOnly
          />
        </div>

        <div className="form-row">
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            pattern="[0-9]{10}"
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        <div className="form-row" ref={skillsRef}>
          <div
            className="skills-dropdown"
            onClick={() => setSkillsOpen(!skillsOpen)}
          >
            {formData.skills.length > 0
              ? formData.skills.join(", ")
              : "Select skills..."}
          </div>
          {skillsOpen && (
            <div className="skills-options">
              {SKILLS_OPTIONS.map((skill, idx) => (
                <label key={idx} className="skills-option">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                  />
                  {skill}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="form-row">
          <select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            required
          >
            <option value="">Select Availability</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekends">Weekends</option>
            <option value="Anytime">Anytime</option>
          </select>
        </div>

        <textarea
          name="message"
          placeholder="Tell us why you want to volunteer..."
          value={formData.message}
          onChange={handleChange}
          rows={4}
          maxLength={500}
        ></textarea>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Join as Volunteer"}
        </button>
      </form>

      {status && <p className="volunteer-status">{status}</p>}
    </div>
  );
};

export default BecomeVolunteer;
