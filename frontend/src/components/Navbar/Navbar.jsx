import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faHeart, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./Navbar.css";

const API_BASE = process.env.REACT_APP_API_URL || "https://onlinedonation.onrender.com/api";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch user details
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsLoggedIn(false);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/users/email`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      setIsLoggedIn(true);
      localStorage.setItem("user", JSON.stringify(res.data));

      // Fetch notifications
      const notifRes = await axios.get(`${API_BASE}/notifications/${res.data.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifRes.data);
      setUnreadCount(notifRes.data.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Error loading user:", err);
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUserData();

    const handleLoginChange = () => fetchUserData();
    window.addEventListener("loginStatusChanged", handleLoginChange);
    window.addEventListener("storage", handleLoginChange);

    return () => {
      window.removeEventListener("loginStatusChanged", handleLoginChange);
      window.removeEventListener("storage", handleLoginChange);
    };
  }, [fetchUserData]);

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || !userData?.id) return;

    try {
      await axios.put(`${API_BASE}/notifications/${userData.id}/mark-read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    navigate("/");
    window.dispatchEvent(new Event("loginStatusChanged"));
  };

  return (
    <nav>
      <h1>
        <FontAwesomeIcon icon={faHeart} style={{ color: "red" }} /> Online Donation
      </h1>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/donations">Donate</Link></li>
        <li><Link to="/campaigns">Campaigns</Link></li>
        {isLoggedIn && <li><Link to="/my-donations">My Donations</Link></li>}
        {isLoggedIn && <li><Link to="/partner">Partner with us</Link></li>}
        <li><Link to="/events">Events</Link></li>
        <li><Link to="/about">About Us</Link></li>
      </ul>

      {isLoggedIn ? (
        <div className="nav-right">
          {/* 🔔 Notifications */}
          <div className="notification-wrapper">
            <FontAwesomeIcon
              icon={faBell}
              className="bell-icon"
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                if (!showNotifDropdown) markAllAsRead();
              }}
            />
            {unreadCount > 0 && <span className="notif-count">{unreadCount}</span>}

            {showNotifDropdown && (
              <div className="notif-dropdown">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n._id || n.id}
                      className={`notif-item ${n.read ? "read" : ""}`}
                    >
                      {n.notification ? n.notification.message : n.message}
                    </div>
                  ))
                ) : (
                  <p className="no-notif">No notifications</p>
                )}
              </div>
            )}
          </div>

          {/* 👤 Avatar (image or initial) */}
          <div className="profile-dropdown-wrapper">
            <div
              className="profile-avatar1"
              title="My Account"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="User"
                  className="navbar-profile-img"
                />
              ) : user?.username ? (
                user.username.charAt(0).toUpperCase()
              ) : (
                <FontAwesomeIcon icon={faUserCircle} />
              )}
            </div>

            {showProfileDropdown && (
              <div className="profile-dropdown">
                <Link to="/profile" onClick={() => setShowProfileDropdown(false)}>
                  Profile
                </Link>
                <Link to="/settings" onClick={() => setShowProfileDropdown(false)}>
                  Settings
                </Link>
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      ) : (
        <ul className="nav-auth">
          <li><Link to="/login">Login / Signup</Link></li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
