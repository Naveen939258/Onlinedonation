# 🎗️ **Online Donation Platform**

## 🚀 **Project Overview**
The **Online Donation Platform** is a full-stack web application built to empower NGOs, donors, and volunteers through a unified donation and event participation system.
It enables users to contribute securely, register for charity events, and receive participation certificates — while providing administrators a complete dashboard to manage campaigns, events, donors, and analytics effortlessly.

---

## 🔗 **Project Links**

- 🌐 **Live Site (Frontend - Netlify):** [Click Here]("https://onlinedonationhope.netlify.app/")_
- 💻 **GitHub Repository (Backend):** [Click Here]("https://github.com/Naveen939258/Onlinedonation")
- 🎥 **Video Demo:** [Click Here]("https://onlinedonationhope.netlify.app/login")
- 📄 **LinkedIn Article:** [Click Here](https://www.linkedin.com/in/kakarla-naveen-2092411b3/)  

---

## 📖 **Introduction**

This platform simplifies online donations and event management for non-profits and donors alike.
Users can browse active campaigns, make secure payments through **Razorpay**, register for events, and receive automated participation certificates generated via the backend.
Admins can manage donations, events, gallery photos, and participant certificates, all from one interactive admin panel.

---

## ✨ **Features**

### 👥 **User Module**

* Secure registration and login using **JWT Authentication**
* Browse and donate to verified charity campaigns
* View detailed cause descriptions and fundraising goals
* **Participate in charity events** and receive **digital certificates** automatically
* Track donation history and total contributions
* Upload event photos after participation (stored via **Cloudinary**)
* Receive WhatsApp notifications for upcoming events (**Twilio Integration**)
* Access a personalized dashboard showing total donations, impact areas, and certificates earned

---

### 💼 **Admin Module**

* Powerful **Admin Dashboard** with analytics and insights
* Manage campaigns, donations, and active events dynamically
* Approve, deactivate, or delete campaigns
* View participant lists, generate or resend **certificates**
* Manage event galleries and past event archives
* Monitor total funds, donor count, and event participation
* Securely manage **Razorpay** and **Twilio** credentials via environment variables

---

### 💳 **Donation & Payment Flow**

* Integrated **Razorpay** checkout for secure online transactions
* Real-time payment verification from backend
* Instant acknowledgement message and success toast
* Donation records synced with **Supabase (PostgreSQL)** or **MySQL**
* Dashboard auto-updates campaign progress and donation totals

---

### 🎉 **Events, Participation & Certificates**

* Users can **view**, **register**, and **participate** in charity events
* Admin can create or edit event details: name, date, venue, type, and capacity
* Real-time registration tracking
* Upload and manage post-event galleries (via **Cloudinary**)
* Automated WhatsApp reminders before events (**Twilio API**)
* **Certificate System:**

  * After an event concludes, each registered user automatically receives a **Participation Certificate (PDF)**
  * Certificates include: event name, user name, date, and digital signature
  * Option to download directly from user dashboard
  * Admin can re-issue or verify certificates through backend logs

---

### 🔔 **Notifications & Communication**

* Automated **WhatsApp reminders** and messages via **Twilio**
* Real-time frontend notifications using React Toastify
* Admin and user alerts for payment success, new events, and certificates
* Logging of all critical operations for transparency

---

### 📊 **Dashboard & Analytics**

**User Dashboard:**

* Total Donations
* Certificates Earned
* Events Joined / Upcoming
* Impact Summary

**Admin Dashboard:**

* Total Campaigns
* Active Events
* Total Funds Raised
* Event Participants
* Campaign Performance Overview

---

## 🧱 **Tech Stack**

| Layer                      | Technologies Used                             |
| -------------------------- | --------------------------------------------- |
| **Frontend**               | React.js, Axios, React Router, CSS / Tailwind |
| **Backend**                | Spring Boot (Java 17), REST APIs              |
| **Database**               | PostgreSQL (Supabase) / MySQL                 |
| **Payment**                | Razorpay                                      |
| **File Storage**           | Cloudinary                                    |
| **Messaging**              | Twilio WhatsApp API                           |
| **Certificate Generation** | iTextPDF / OpenPDF                            |
| **Authentication**         | JWT Tokens                                    |
| **Deployment**             | Render (Backend) + Netlify (Frontend)         |

---

## 📸 **Screenshots**

- 🏠 **Home Page:** [Click Here]
- 🎁 **Campaigns Page:** [Click Here]
- 🎉 **Events & Certificates Page:** [Click Here]
- 💰 **Donation Flow:** [Click Here]
- 📊 **Admin Dashboard:** [Click Here]

---

## 🧩 **Future Enhancements**

* AI-based donor recommendations for campaigns
* Leaderboard of top contributors
* Email delivery for participation certificates
* Automated NGO verification badge system
* Multi-language support for donors globally
* Mobile App (React Native) version

---

## 👤 **Author**

- **Name:** Kakarla Naveen
- **GitHub:** [Click Here](https://github.com/naveen939258)
- **LinkedIn:** [Click Here](https://www.linkedin.com/in/kakarla-naveen-2092411b3/)
- **Email:** [22000031998cseh@gmail.com](mailto:22000031998cseh@gmail.com)

---

## ⭐ **Support**

If you find this project helpful, please ⭐ star the repository and share it with others!
Your support inspires continued development and new features. 🙏

> “Together we rise by lifting others.” 🌍
