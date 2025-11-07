import React from "react";
import { useLocation, Link } from "react-router-dom";
import "./CSS/Billing.css";

const Billing = () => {
  const location = useLocation();
  const donation = location.state?.donation;

  if (!donation) {
    return (
      <div className="billing-page">
        <h2>No donation details found</h2>
        <Link to="/donations" className="btn-home">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="billing-page">
<h1 className="billing-title">🎉 Thank You, {donation.donorName || "Donor"}!</h1>

      <div className="order-card">
        <h3>Donation Receipt</h3>

        <p><b>Donor Name:</b> {donation.donorName || "-"}</p>
        <p><b>Email:</b> {donation.email || donation.userEmail || "-"}</p>
        <p><b>Campaign:</b> {donation.campaignName || donation.campaignId?.name || "-"}</p>
        <p><b>Amount Donated:</b> ₹{donation.amount?.toLocaleString() || 0}</p>

        <hr className="divider" />

        <p><b>Order ID:</b> {donation.razorpayOrderId || donation.orderId || "-"}</p>
        <p><b>Payment ID:</b> {donation.razorpayPaymentId || donation.paymentId || "-"}</p>
        <p>
          <b>Status:</b>{" "}
          <span
            className={`status ${
              donation.status === "Success" || donation.status === "Processed"
                ? "status-success"
                : donation.status === "Pending"
                ? "status-pending"
                : "status-failed"
            }`}
          >
            {donation.status || "Pending"}
          </span>
        </p>
        <p><b>Date:</b> {donation.date ? new Date(donation.date).toLocaleString() : "-"}</p>

        <div className="billing-buttons">
          <Link to="/my-donations" className="btn-home">💖 My Donations</Link>
          <Link to="/campaigns" className="btn-campaigns">🎯 Back to Campaigns</Link>
        </div>
      </div>
    </div>
  );
};

export default Billing;
