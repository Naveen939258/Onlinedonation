import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

// Pages
import Home from "./pages/Home";
import LoginSignup from "./pages/LoginSignup";
import Dashboard from "./pages/Dashboard";
import Donation from "./pages/Donations";
import Campaign from "./pages/Campaigns";
import AboutUs from "./pages/AboutUs";
import MyDonations from "./pages/MyDonations";
import Profile from "./pages/Profile";

// New Donation Flow Pages
import PaymentPage from "./pages/Paymentpage";
import Billing from "./pages/Billing";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import BecomeVolunteer from "./pages/BecomeVolunteer";
import Impact from "./pages/Impact";
import Team from "./pages/Team";
import Partner from "./pages/Partner";
import Events from "./pages/Events";
import News from "./pages/News";
import Settings from "./pages/Settings";

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/donations" element={<Donation />} />
            <Route path="/campaigns" element={<Campaign />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/my-donations" element={<MyDonations />} />
            <Route path="/profile" element={<Profile />} />

            {/* New Donation Routes */}
            
            <Route path="/payment" element={<PaymentPage/>} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/faq" element={<FAQ/>} />
            <Route path="/contact" element={<Contact/>} />
            <Route path="/volunteer" element={<BecomeVolunteer/>}/>
            <Route path="/impact" element={<Impact/>} />
            <Route path="/team" element={<Team/>} />
            <Route path="/partner" element={<Partner/>} />
            <Route path="/events" element={<Events/>}/>
            <Route path="/news" element={<News/>}/>
            <Route path="/settings" element={<Settings/>}/>
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
