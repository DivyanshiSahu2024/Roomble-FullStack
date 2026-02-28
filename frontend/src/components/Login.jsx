/**
 * This component renders the login page for the Roomble application.
 * It allows users to log in as either a tenant or a landlord,
 * with options to remember their credentials and navigate to the appropriate dashboard.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/Login.css";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import config from "../config.json";
import logo from "/logo.png";

const Login = () => {
  // State variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("tenant"); // 'tenant' or 'landlord'
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load remembered credentials from localStorage on component mount
  useEffect(() => {
    if (localStorage.getItem("authtoken")) {
      navigate("/");
    }
  }, []);

  // Handle user type change (tenant or landlord)
  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Send login request to the backend
      const response = await fetch(
        `${config.backend}/api/${userType}/auth/${userType}_login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, remember_me: rememberMe }),
        }
      );

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        // Save authentication token and optionally remember credentials
        localStorage.setItem("authtoken", data.authtoken);
        

        // Navigate to the appropriate dashboard
        navigate(
          userType === "landlord" ? "/landlord-dashboard" : "/tenant-dashboard"
        );
        window.location.reload();
      } else {
        // Handle login failure
        setError(data.message || "Invalid login credentials");
        toast.error(data.message || "Invalid login credentials");
      }
    } catch (err) {
      setLoading(false);
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="login-main-container">
      {/* Left Section: Logo */}
      <div className="login-logo-container">
        <img src={logo} alt="Roomble Logo" />
      </div>

      {/* Right Section: Login Form */}
      <div className="login-login-box">
        <h2 className="login-login-title">Login to your Account</h2>
        <p className="login-subtext">See what is going on with your business</p>

        {/* Tenant / Landlord buttons */}
        <div className="login-user-type-buttons">
          <button
            className={`login-user-btn ${
              userType === "tenant" ? "selected" : ""
            }`}
            onClick={() => handleUserTypeChange("tenant")}
          >
            <img
              src={userType === "landlord" ? "/key.png" : "/key_white.png"}
              style={{ width: "50px", height: "50px" }}
            />
            Tenant
          </button>
          <button
            className={`login-user-btn ${
              userType === "landlord" ? "selected" : ""
            }`}
            onClick={() => handleUserTypeChange("landlord")}
          >
            <img
              src={userType === "landlord" ? "/white_house.png" : "/house.jpg"}
              style={{ width: "50px", height: "50px" }}
            />
            Landlord
          </button>
        </div>

        {/* Login Form */}
        <form className="login-login-form" onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="login-email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password" className="login-page-label">
            Password
          </label>
          <input
            type="password"
            id="login-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Remember Me and Forgot Password */}
          <div className="login-remember-forgot">
            <span className="login-remember-container">
              <input
                type="checkbox"
                id="login-rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="rememberMe" className="login-remember-label">
                Remember Me for a month
              </label>
            </span>
            <Link to="/forgot-password" className="login-forgot-password">
              Forgot Password?
            </Link>
          </div>

          {/* Error Message */}
          {error && <p className="login-error-text">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            className="login-login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <p className="login-register-text">
          Not Registered Yet?{" "}
          <Link
            to={userType === "landlord" ? "/signup-landlord" : "/signup-tenant"}
          >
            Create an account
          </Link>
        </p>

        {/* Footer Text */}
        <p className="login-footer-text">
          With Roomble, you'll stumble on the perfect place to rumble!
        </p>
      </div>
    </div>
  );
};

export default Login;
