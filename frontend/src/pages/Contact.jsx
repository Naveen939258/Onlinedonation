// src/pages/Contact.jsx
import React, { useState } from "react";
import "./CSS/Contact.css";

const Contact = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="contact-page">
      {/* Page Title */}
      <h1 className="contact-title">📞 Get in Touch With Us</h1>
      <p className="contact-subtitle">
        We’re here to help you with donations, campaigns, or any questions you have.
      </p>

      {/* Tabs */}
      <div className="contact-tabs">
        <button
          className={activeTab === "chat" ? "active" : ""}
          onClick={() => setActiveTab("chat")}
        >
          💬 Chat
        </button>
        <button
          className={activeTab === "email" ? "active" : ""}
          onClick={() => setActiveTab("email")}
        >
          📧 Email
        </button>
        <button
          className={activeTab === "call" ? "active" : ""}
          onClick={() => setActiveTab("call")}
        >
          📞 Call
        </button>
        <button
          className={activeTab === "office" ? "active" : ""}
          onClick={() => setActiveTab("office")}
        >
          📍 Office
        </button>
      </div>

      {/* Content */}
      <div className="contact-content">
        {activeTab === "chat" && (
          <div className="contact-box">
            <h3>Chat with Our Support Team</h3>
            <p>
              Need instant help? Reach us on WhatsApp and get quick assistance from
              our donation support team.
            </p>
            <p>
              💚 Donation Support:{" "}
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
              >
                <b>+91 98765 43210</b>
              </a>
            </p>
            <p>
              💼 NGO & Campaign Support:{" "}
              <a
                href="https://wa.me/918765432109"
                target="_blank"
                rel="noreferrer"
              >
                <b>+91 87654 32109</b>
              </a>
            </p>
          </div>
        )}

        {activeTab === "email" && (
          <div className="contact-box">
            <h3>Email Us</h3>
            <p>
              📩 General Inquiries:{" "}
              <a href="mailto:support@donationhub.org">
                <b>support@donationhub.org</b>
              </a>
            </p>
            <p>
              💳 Payment / Refunds:{" "}
              <a href="mailto:billing@donationhub.org">
                <b>billing@donationhub.org</b>
              </a>
            </p>
            <p>
              🤝 NGO Partnerships:{" "}
              <a href="mailto:partnerships@donationhub.org">
                <b>partnerships@donationhub.org</b>
              </a>
            </p>
          </div>
        )}

        {activeTab === "call" && (
          <div className="contact-box">
            <h3>Call Us</h3>
            <p>
              📞 Customer Support: <b>1800-234-5678</b>
            </p>
            <p>
              📞 NGO / Campaign Queries: <b>1800-987-6543</b>
            </p>
            <p className="contact-note">
              (Available Monday to Saturday, 9:00 AM – 6:00 PM IST)
            </p>
          </div>
        )}
        {activeTab === "office" && (
          <div className="contact-box">
            <h3>Visit Our Office</h3>
            <p>
              🏢 <b>Scholarship Tracker Headquarters</b><br />
              1st Floor,King House,near apollo medical shop<br />
              Green Fields,Jn road,Rajahmundry, Andhra Pradesh – 533103<br />
              📍 <a href="https://www.google.com/maps?q=sasi+jn.road,+Rajahmundry,+Andhra+Pradesh" 
                 target="_blank" rel="noreferrer">
                View on Google Maps
              </a>
            </p>
            <p>
              🕓 <b>Office Hours:</b> Monday – Saturday, 9:00 AM – 6:00 PM
            </p>
            <p>
              👨‍💼 <b>Contact Person:</b> Mr. Naveen Kakarla, Support Lead
            </p>
            <iframe
              title="Office Location"
              className="office-map"
              src="https://www.google.com/maps?q=sasi+jn.road,+Rajahmundry,+Andhra+Pradesh&output=embed"
              width="100%"
              height="250"
              style={{ border: "0", borderRadius: "12px", marginTop: "10px" }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contact;
