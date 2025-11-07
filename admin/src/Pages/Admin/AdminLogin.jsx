// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../CSS/AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/admin/auth/login", {
        email,
        password,
      });

      // ✅ Match backend response structure
      const { token, admin } = res.data;

      if (!admin) {
        setError("Invalid admin credentials");
        setLoading(false);
        return;
      }

      // ✅ Save details in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("userEmail", admin.email || "");

      // ✅ Redirect to admin dashboard
      navigate("/");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Login failed. Check credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Admin Sign In</h2>
        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@donation.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </label>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="login-note">
          Use an admin account. If you don't have one, register via backend or promote a user.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
