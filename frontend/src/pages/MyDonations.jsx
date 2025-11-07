import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/MyDonations.css";

const API_BASE = "https://onlinedonation.onrender.com/api";

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await axios.get(`${API_BASE}/donations/my`, {
          headers: { "auth-token": token },
        });
        setDonations(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch donation history");
      }
    };
    fetchDonations();
  }, [token]);

  return (
    <div className="donations-page">
      <h1 className="donations-title">💖 My Donation History</h1>
      {donations.length === 0 ? (
        <p>No donations found</p>
      ) : (
        <table className="donations-table">
          <thead>
            <tr>
              <th>Donor Name</th>
              <th>Campaign</th>
              <th>Donation ID</th>
              <th>Amount</th>
              <th>Order ID</th>
              <th>Payment ID</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d.id}>
                <td>{d.donorName || "—"}</td>
                <td>{d.campaignName || "—"}</td>
                <td>{d.id}</td>
                <td>₹{d.amount}</td>
                <td>{d.razorpayOrderId || "-"}</td>
                <td>{d.razorpayPaymentId || "-"}</td>
                <td>{d.date ? new Date(d.date).toLocaleDateString() : "-"}</td>
                <td>
                  {d.status === "Success" || d.status === "Processed"
                    ? "✅ Payment Successful"
                    : d.status === "Pending"
                    ? "⏳ Pending"
                    : "❌ Failed"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyDonations;
