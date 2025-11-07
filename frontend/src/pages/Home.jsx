import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Home.css";

const Home = () => {
  const navigate = useNavigate();

  // Handle "Get Started" button click
  const handleGetStarted = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard"); // logged in → dashboard
    } else {
      navigate("/login"); // not logged in → login
    }
  };

  return (
    <div className="home">
      {/* 🌟 Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Make a Difference Today</h1>
          <p>Support campaigns and donate to causes that matter to you.</p>

          <div className="hero-buttons">
            <Link to="/campaigns" className="btn-volunteer">
              Explore Campaigns
            </Link>
            <Link to="#" className="btn-secondary" onClick={handleGetStarted}>
              Get Started
            </Link>
            {/* 🆕 Added CTA for Volunteer */}
            <Link to="/volunteer" className="btn-volunteer">
              🤝 Become a Volunteer
            </Link>
          </div>
        </div>
        {/* 📰 Scrolling Updates Section */}
        {/* 📰 Scrolling Updates Section */}
<div className="scroll-section">
  <div className="scroll-content">
    <span>💖 New Campaigns Launched This Week!</span>
    <span>🌱 10,000+ Meals Donated to the Needy!</span>
    <span>🏥 Medical Fundraising Now Available!</span>
    <span>🎯 95% Donation Transparency Achieved!</span>
    <span>⚡ Join Our Mission to Help More Lives!</span>
    <span>🤝 Volunteers Joined from 20+ Cities!</span>
    <span>📦 Relief Supplies Distributed Across States!</span>
    <span>🎓 Supporting Education for 2,000+ Students!</span>
    <span>🏡 Shelter Support for Homeless Families!</span>
    <span>🌍 Together, We’re Making a Global Impact!</span>

    </div>
</div>

      </section>
      

      {/* 📊 Stats Section */}
      <section className="stats">
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

      {/* 💡 Features Section */}
      <section className="features">
        <h2>Why Donate With Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>💖 Trusted Campaigns</h3>
            <p>All campaigns are verified to ensure your donations reach the right cause.</p>
          </div>
          <div className="feature-card">
            <h3>⚡ Fast & Secure Donations</h3>
            <p>Donate instantly using multiple payment options with full security.</p>
          </div>
          <div className="feature-card">
            <h3>📊 Transparent Tracking</h3>
            <p>Track how your donations are being used with detailed progress reports.</p>
          </div>
        </div>
      </section>

      {/* 🚀 Call to Action Section */}
      <section className="cta">
        <h2>Ready to Make an Impact?</h2>
        <p>Join thousands of donors and support campaigns you care about.</p>
        <div className="cta-buttons">
          <Link to="/campaigns" className="btn-primary">
            Explore Campaigns
          </Link>
          <Link to="/volunteer" className="btn-primary">
            Become a Volunteer
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
