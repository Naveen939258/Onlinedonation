import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./CSS/Donations.css";

const Donation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const campaignId = queryParams.get("campaignId");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/user/campaigns");
        let data = res.data;

        // If campaignId in URL, filter it
        if (campaignId) {
          data = data.filter((c) => c.id.toString() === campaignId);
        }

        setCampaigns(data);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [campaignId]);

  const getProgress = (raised, goal) => Math.min((raised / goal) * 100, 100);

  const handleDonate = (campaign) => {
    const amount = 500; // You can later add amount input field
    navigate(`/payment?campaign=${encodeURIComponent(campaign.name)}&amount=${amount}`);
  };

  if (loading) {
    return <div className="loading">Loading campaigns...</div>;
  }

  return (
    <div className="plans-page">
      <div className="plans-header">
        <h2>Donate to Campaigns</h2>
        <p style={{ color: "#cbd5e1" }}>
          {campaignId
            ? "You're donating to this campaign."
            : "Browse our active campaigns and make a secure donation."}
        </p>
      </div>

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
                  className="subscribe-btn"
                  onClick={() => handleDonate(campaign)}
                >
                  Donate Now
                </button>
                {!campaignId && (
                  <button
                    className="details-btn"
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
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
                    width: `${getProgress(selectedCampaign.raised, selectedCampaign.goal)}%`,
                  }}
                ></div>
              </div>

              <p className="plan-desc">{selectedCampaign.description}</p>
              <p style={{ fontWeight: "600", marginTop: "1rem" }}>
                <b>Impact:</b> {selectedCampaign.impact}
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="subscribe-btn"
                onClick={() => handleDonate(selectedCampaign)}
              >
                Donate
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

export default Donation;
