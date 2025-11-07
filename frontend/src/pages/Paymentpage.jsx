import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./CSS/Paymentpage.css";

const API_BASE = "http://localhost:8080/api";

const Paymentpage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [campaign, setCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState(0);
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Fetch user email from backend
  useEffect(() => {
    const fetchUserEmail = async () => {
      if (!token) return;

      try {
        const res = await axios.get(`${API_BASE}/users/email`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmail(res.data.email);
      } catch (err) {
        console.error("Failed to fetch user email", err);
        alert("Please login again.");
        navigate("/login");
      }
    };

    fetchUserEmail();
  }, [token, navigate]);

  // ✅ Read campaign and amount from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const campaignName = params.get("campaign");
    const amount = parseInt(params.get("amount")) || 0;

    if (!campaignName || amount <= 0) {
      alert("Invalid donation");
      navigate("/donations");
      return;
    }

    setCampaign({ name: campaignName });
    setDonationAmount(amount);
  }, [location.search, navigate]);

  // ✅ Handle Razorpay payment
  const handlePayment = async () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded");
      return;
    }
    if (!donorName.trim()) {
      alert("Please enter a name for this donation.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1️⃣ Create Razorpay order
      const orderRes = await axios.post(
        `${API_BASE}/donations/create-order`,
        {
          campaignName: campaign.name,
          amount: donationAmount,
          donorName,
          email,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = orderRes.data;

      // 2️⃣ Open Razorpay checkout
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Online Donation",
        description: `Donation for ${campaign.name}`,
        order_id: order.id,
        prefill: {
          name: donorName,
          email: email || "donor@example.com",
          contact: "9999999999",
        },
        theme: { color: "#0f52ba" },
        handler: async function (response) {
          try {
            // 3️⃣ Verify payment
            const verifyRes = await axios.post(
              `${API_BASE}/donations/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                campaignName: campaign.name,
                amount: donationAmount,
                donorName,
                email,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("✅ Donation successful!");
            navigate("/billing", { state: { donation: verifyRes.data } });
          } catch (err) {
            console.error("Verification failed", err.response?.data || err.message);
            alert(
              "❌ Payment verification failed: " +
                (err.response?.data?.message || err.message)
            );
          } finally {
            setIsProcessing(false);
          }
        },
        modal: { ondismiss: () => setIsProcessing(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (err) => {
        console.error("Payment failed:", err);
        alert(err?.error?.description || "Payment failed");
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed", err);
      alert(err.response?.data?.message || "Payment failed");
      setIsProcessing(false);
    }
  };

  if (!campaign) return <p>Loading donation...</p>;

  return (
    <div className="payment-page">
      <h2>💖 Donate to {campaign.name}</h2>

      <div className="donor-name-box">
        <label>Donation Made In The Name Of:</label>
        <input
          type="text"
          placeholder="e.g., In Memory of Someone"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
        />
      </div>

      <div className="donation-amount">
        <label>Donation Amount (₹): </label>
        <input
          type="number"
          min="1"
          value={donationAmount}
          onChange={(e) => setDonationAmount(parseInt(e.target.value))}
        />
      </div>

      <button onClick={handlePayment} disabled={isProcessing || !email}>
        {isProcessing ? "Processing..." : `Donate ₹${donationAmount}`}
      </button>
    </div>
  );
};

export default Paymentpage;
