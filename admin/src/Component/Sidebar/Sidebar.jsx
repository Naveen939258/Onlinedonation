import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin</h2>
      <ul>
        <li>
          <NavLink to="/" end>
            📊 Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/donors">
            👥 Donors
          </NavLink>
        </li>
        <li>
          <NavLink to="/campaigns">
            📦 Campaigns
          </NavLink>
        </li>
        <li>
          <NavLink to="/donations">
            💳 Donations
          </NavLink>
        </li>
        <li>
          <NavLink to="/notifications">
            🔔 Notifications
          </NavLink>
        </li>
        <li>
          <NavLink to="/Volunteers">
            🧑‍🤝‍🧑 Volunteers
          </NavLink>
        </li>
        <li>
          <NavLink to="/partner">
            🤝 Partners
          </NavLink>
        </li>
        <li>
          <NavLink to="/event">
            🎉 Events
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
