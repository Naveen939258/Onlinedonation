import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/LoginSignup.css";

const API_BASE = "https://onlinedonation.onrender.com/api"; // Spring Boot API base URL

const LoginSignup = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const endpoint = isSignup ? "/auth/register" : "/auth/login";

      // Prepare payload for Spring Boot backend
      const payload = isSignup
        ? {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            role: "DONOR", // default role in Spring Boot
          }
        : { email: formData.email, password: formData.password };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`${isSignup ? "Signup" : "Login"} Successful ✅`);

        // Store JWT token and donor info from Spring Boot backend
        localStorage.setItem("token", data.token);
        localStorage.setItem("donor", JSON.stringify(data.user));

        navigate("/"); // redirect to home
        window.dispatchEvent(new Event("loginStatusChanged"));
      } else {
        setMessage(data.message || "Something went wrong ❌"); // Spring Boot usually returns `message`
      }
    } catch (err) {
      setMessage("Server error ❌");
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{isSignup ? "Sign Up as Donor" : "Donor Login"}</h1>

        <div className="loginsignup-fields">
          {isSignup && (
            <input
              type="text"
              name="username"
              placeholder="Full Name"
              value={formData.username}
              onChange={handleChange}
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          {isSignup && (
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />
          )}
        </div>

        <button onClick={handleSubmit}>
          {isSignup ? "Sign Up" : "Login"}
        </button>

        <p className="loginsignup-toggle">
          {isSignup
            ? "Already a donor? "
            : "Don't have a donor account? "}
          <span onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>

        {message && <p className="loginsignup-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoginSignup;
