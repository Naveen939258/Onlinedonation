import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebook,
  faLinkedin,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import "./Footer.css";

const Footer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleLoginStatusChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };

    handleLoginStatusChange();
    window.addEventListener("loginStatusChanged", handleLoginStatusChange);

    return () => {
      window.removeEventListener("loginStatusChanged", handleLoginStatusChange);
    };
  }, []);

  return (
    <footer className="footer">
      <div className="footer-sections">
        {/* Quick Links */}
        <div className="footer-column">
          <h2>Quick Links</h2>
          <ul>
            <li><Link to="/donations">Donate Now</Link></li>
            <li><Link to="/campaigns">Our Campaigns</Link></li>
            {isLoggedIn ? (
              <li><Link to="/my-donations">My Donations</Link></li>
            ) : (
              <li><Link to="/login">My Donations</Link></li>
            )}
          </ul>
        </div>

        {/* Support */}
        <div className="footer-column">
          <h2>Support</h2>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/volunteer">Become a Volunteer</Link></li>
          </ul>
        </div>

        {/* About */}
        <div className="footer-column">
          <h2>About</h2>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/impact">Our Impact</Link></li>
            <li><Link to="/team">Our Team</Link></li>
          </ul>
        </div>

        {/* Get Involved */}
        <div className="footer-column">
          <h2>Get Involved</h2>
          <ul>
            <li><Link to="/partner">Partner With Us</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/news">News & Updates</Link></li>
          </ul>
        </div>
      </div>

      {/* Social + Branding */}
      <div className="footer-bottom">
        <div className="social-icons">
          <a
            href="https://www.instagram.com/accounts/login/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faFacebook} />
          </a>
          <a
            href="https://www.linkedin.com/in/kakarla-naveen-2092411b3/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
          <a href="https://wa.me/919392589802" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faWhatsapp} />
          </a>
        </div>

        <p>&copy; {new Date().getFullYear()} Online Donation Platform. All Rights Reserved.</p>
        <p className="sub-text">Together We Can Make a Difference ❤️</p>
      </div>
    </footer>
  );
};

export default Footer;
