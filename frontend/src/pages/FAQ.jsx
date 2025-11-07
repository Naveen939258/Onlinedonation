// src/pages/FAQ.jsx
import React, { useState } from "react";
import "./CSS/FAQ.css";

const faqData = {
  "Donations & Payments": [
    {
      q: "How can I make a donation?",
      a: "You can donate by visiting any campaign page and clicking the 'Donate Now' button. You’ll be guided through a secure payment process.",
    },
    {
      q: "What payment methods are supported?",
      a: "We support UPI, Credit/Debit Cards, Net Banking, and popular digital wallets for quick and secure transactions.",
    },
    {
      q: "Is my payment information secure?",
      a: "Yes, all payments are processed through trusted gateways like Razorpay with end-to-end encryption.",
    },
  ],

  "Campaigns & Causes": [
    {
      q: "How do I know if a campaign is genuine?",
      a: "All campaigns go through a verification process before being published. We ensure transparency and provide campaign organizer details on each campaign page.",
    },
    {
      q: "Can I donate to multiple campaigns?",
      a: "Absolutely! You can support as many causes as you like — simply visit each campaign and donate separately.",
    },
    {
      q: "Can I start my own fundraising campaign?",
      a: "Yes, if you are a registered user, you can start your own campaign by going to 'Create Campaign' and filling out the required details.",
    },
  ],

  "My Donations": [
    {
      q: "Where can I see my past donations?",
      a: "You can view all your donations under the 'My Donations' page in your dashboard after logging in.",
    },
    {
      q: "Can I download donation receipts?",
      a: "Yes, each donation entry includes an option to download or print your receipt for records or tax purposes.",
    },
    {
      q: "What if my payment fails?",
      a: "If your payment fails, no amount will be deducted. You can try donating again or contact support if the issue persists.",
    },
  ],

  "Accounts & Profiles": [
    {
      q: "How do I edit my profile details?",
      a: "Go to the 'Profile' page, click on 'Edit Profile', and update your name, phone, or password after verifying your current password.",
    },
    {
      q: "Can I delete my account?",
      a: "Yes, you can request account deletion through our support team. Once deleted, your data and donation records will be permanently removed.",
    },
  ],

  "Support & Contact": [
    {
      q: "How can I reach customer support?",
      a: "You can contact our support team via email or the Contact Us page for any donation-related queries.",
    },
    {
      q: "Do you provide tax exemption certificates?",
      a: "Yes, if the campaign organizer is a registered NGO eligible under Section 80G, your donation receipt will include tax exemption details.",
    },
  ],
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState(Object.keys(faqData)[0]);
  const [openQuestion, setOpenQuestion] = useState(null);

  return (
    <div className="faq-page">
      <h1 className="faq-title">❓ Help & FAQs</h1>
      <div className="faq-container">
        {/* Sidebar */}
        <div className="faq-sidebar">
          <h3 className="sidebar-heading">Categories</h3>
          {Object.keys(faqData).map((category) => (
            <div
              key={category}
              className={`sidebar-item ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => {
                setActiveCategory(category);
                setOpenQuestion(null);
              }}
            >
              {category}
            </div>
          ))}
        </div>

        {/* Questions */}
        <div className="faq-content">
          {faqData[activeCategory].map((item, index) => (
            <div
              key={index}
              className={`faq-item ${openQuestion === index ? "open" : ""}`}
            >
              <div
                className="faq-question"
                onClick={() =>
                  setOpenQuestion(openQuestion === index ? null : index)
                }
              >
                {item.q}
                <span className="faq-toggle">
                  {openQuestion === index ? "−" : "+"}
                </span>
              </div>
              {openQuestion === index && (
                <div className="faq-answer">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
