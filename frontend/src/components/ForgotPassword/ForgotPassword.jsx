
  /**
  * This page allows users to reset their password by entering their registered email.
  * Upon successful submission, users are redirected to the OTP verification page.
  * Users can select their account type (tenant or landlord) and submit their email to receive a password reset link.
  * The page handles form submission, error handling, and navigation to the OTP verification page.
  */

import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../css/ForgotPassword/ForgotPassword.css"; // Import the CSS specific to this component
import logo from "../../../public/logo.png";
import { Basecontext } from "../../context/base/Basecontext";
import config from "../../config.json";
import { toast } from "react-toastify";
import { useEffect } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userType, setUserType] = useState("tenant"); // 'tenant' or 'landlord'
  const [somethingwentwrong1, setSomethingwentwrong1] = useState(false);
  const [somethingwentwrong2, setSomethingwentwrong2] = useState(false);
  const navigate = useNavigate();

  const state = useContext(Basecontext);
  const { user, setUser, fetuser } = state;
  fetuser();

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const accounttype = userType;

    try {
      const response = await fetch(
        `${config.backend}/api/forgotPassword/enteremail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accounttype: accounttype, email: email }),
        }
      );

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        localStorage.setItem("authtoken", data.authtoken);
        navigate(`/otp-forgot?accounttype=${accounttype}`);

        setTimeout(() => {
          console.log("Saved Token:", localStorage.getItem("authtoken"));
        }, 1500);

        // navigate("/otp-forgot");
      } else {
        setError(data.message || "Email not found. Please try again.");
        setSomethingwentwrong1(true);
      }
    } catch (err) {
      setLoading(false);
      setError("Network error. Please try again.");
      setSomethingwentwrong2(true);
    }
  };

  useEffect(() => {
    if (somethingwentwrong1) {
      toast.error("Email not found. Please try again.");
    } else if (somethingwentwrong2) {
      toast.error("Network error. Please try again.");
    }
  }, [somethingwentwrong1, somethingwentwrong2]);

  return (
    <div className="fp-main-container">
      {/* Left Section: Logo */}
      <div className="fp-logo-container">
        <img src={logo} alt="Roomble Logo" />
      </div>

      {/* Right Section: Forget Password Form */}
      <div className="fp-login-box">
        <h2 className="fp-title">Forgot Password?</h2>

        {/* Tenant / Landlord buttons */}
        <div className="login-user-type-buttons">
          <button
            className={`login-user-btn ${
              userType === "tenant" ? "selected" : ""
            }`}
            onClick={() => setUserType("tenant")}
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
            onClick={() => setUserType("landlord")}
          >
            <img
              src={userType === "landlord" ? "/white_house.png" : "/house.jpg"}
              style={{ width: "50px", height: "50px" }}
            />
            Landlord
          </button>
        </div>

        <form className="fp-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Enter your registered email</label>
          <input
            type="email"
            id="fp-email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="fp-submit-button" disabled={loading}>
            {loading ? "Redirecting..." : "Submit"}
          </button>
        </form>

        {/* Navigation Links */}
        <p className="fp-register-text">
          Remember your password? <Link to="/login">Login</Link>
        </p>
        <p className="fp-register-text">
          Not Registered Yet? <Link to="/signup-tenant">Sign up</Link>
        </p>

        <p className="footer-text">
          With Roomble, you'll stumble on the perfect place to rumble!
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
