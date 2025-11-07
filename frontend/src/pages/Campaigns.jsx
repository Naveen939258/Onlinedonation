import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CSS/Donations.css";

const Campaign = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const navigate = useNavigate();

  // ✅ Fetch campaigns from backend
  useEffect(() => {
    axios
      .get("https://onlinedonation.onrender.com/api/user/campaigns")
      .then((res) => setCampaigns(res.data))
      .catch((err) => console.error("Error fetching campaigns:", err));
  }, []);

  const getProgress = (raised, goal) => Math.min((raised / goal) * 100, 100);

  // ✅ Navigate to donation page for selected campaign
  const handleDonateClick = (campaignId) => {
    navigate(`/donations?campaignId=${campaignId}`);
  };

  // ✅ Handle share functionality
  const handleShare = (campaign) => {
    const shareUrl = `${window.location.origin}/donations?campaignId=${campaign.id}`;
    if (navigator.share) {
      navigator.share({
        title: campaign.name,
        text: `Support "${campaign.name}" and make an impact!`,
        url: shareUrl,
      }).catch((err) => console.error("Share failed:", err));
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="plans-page">
      <div className="plans-header">
        <h2>All Campaigns</h2>
        <p style={{ color: "#cbd5e1" }}>
          Explore all active campaigns and see how your contribution can make an impact.
        </p>
      </div>

      {/* ✅ Campaign Cards */}
      <div className="plans-grid">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="plan-card">
            <div className="plan-card-top">
              <h3>{campaign.name}</h3>
              <p>
                <b>Beneficiary:</b> {campaign.beneficiary}
              </p>
              <h2 className="plan-price">
                Raised: ₹{campaign.raised.toLocaleString()} / Goal: ₹
                {campaign.goal.toLocaleString()}
              </h2>
            </div>

            <div className="plan-card-bottom">
              <p className="plan-desc">{campaign.description}</p>
              <div className="plan-actions">
                <button
                  className="details-btn"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  View Details
                </button>
                <button
                  className="subscribe-btn"
                  onClick={() => handleDonateClick(campaign.id)}
                >
                  Donate Now
                </button>
                <button
                  className="share-btn"
                  onClick={() => handleShare(campaign)}
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Details Modal */}
      {selectedCampaign && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedCampaign.name}</h3>
              <button onClick={() => setSelectedCampaign(null)}>&times;</button>
            </div>

            <div className="modal-body">
              <p>
                <b>Beneficiary:</b> {selectedCampaign.beneficiary}
              </p>
              <p>
                <b>Goal:</b> ₹{selectedCampaign.goal.toLocaleString()}
              </p>
              <p>
                <b>Raised:</b> ₹{selectedCampaign.raised.toLocaleString()}
              </p>

              <div className="progress-bar">
                <div
                  className="progress"
                  style={{
                    width: `${getProgress(
                      selectedCampaign.raised,
                      selectedCampaign.goal
                    )}%`,
                  }}
                ></div>
              </div>

              <p className="plan-desc">{selectedCampaign.description}</p>
              <p style={{ fontWeight: "600", marginTop: "1rem" }}>
                <b>Impact:</b> {selectedCampaign.impact}
              </p>

              {selectedCampaign.donations && (
                <div className="donation-history">
                  <h4>Recent Donations:</h4>
                  <ul>
                    {selectedCampaign.donations.map((donation, i) => (
                      <li key={i}>
                        {donation.donorName} - ₹{donation.amount.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="subscribe-btn"
                onClick={() => handleDonateClick(selectedCampaign.id)}
              >
                Donate
              </button>
              <button
                className="share-btn"
                onClick={() => handleShare(selectedCampaign)}
              >
                Share
              </button>
              <button
                className="cancel-btn"
                onClick={() => setSelectedCampaign(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaign;
