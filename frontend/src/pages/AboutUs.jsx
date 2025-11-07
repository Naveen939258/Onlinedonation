import React from "react";
import "./CSS/AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <h1>About Us</h1>
        <p>
          We connect generous donors with impactful campaigns that transform lives and communities.
        </p>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>100+</h3>
            <p>Active Campaigns</p>
          </div>
          <div className="stat-card">
            <h3>5000+</h3>
            <p>Donors</p>
          </div>
          <div className="stat-card">
            <h3>$1M+</h3>
            <p>Funds Raised</p>
          </div>
          <div className="stat-card">
            <h3>🌍</h3>
            <p>Global Impact</p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="about-sections">
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            Empower individuals and communities by providing a secure platform for donations. We create measurable impact in education, healthcare, animal welfare, and more.
          </p>
        </div>

        <div className="about-section">
          <h2>Our Vision</h2>
          <p>
            A world where everyone has the opportunity to thrive. No child is deprived of education, no family lacks basic healthcare, and no vulnerable animal is left behind.
          </p>
        </div>

        <div className="about-section">
          <h2>Our Values</h2>
          <ul>
            <li><b>Transparency:</b> Every donation reaches its intended cause.</li>
            <li><b>Integrity:</b> Honesty and ethics guide every decision.</li>
            <li><b>Impact:</b> Campaigns that truly change lives.</li>
            <li><b>Community:</b> Collaboration with donors, volunteers, and NGOs.</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Meet the Team</h2>
          <p>
            Our passionate team works tirelessly to connect donors with campaigns that matter most.
          </p>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="about-cta">
        <h2>Join Us Today!</h2>
        <p>Your contribution can make a difference. Every donation counts.</p>
        <a href="/campaigns" className="btn-primary">Explore Campaigns</a>
      </section>
    </div>
  );
};

export default AboutUs;
