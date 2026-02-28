
/**
* This page allows users to verify their OTP for password reset
* Upon successful verification, users are redirected to the "Set New Password" page
*/

import React from "react";
import { useState, useRef, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../css/ForgotPassword/OTPPageForgot.css"; // Import the CSS specific to this component
import logo from "../../../public/logo.png"; // Logo for the left section
import { Basecontext } from "../../context/base/Basecontext";
import { jwtDecode } from "jwt-decode";
import config from "../../config.json";
import { toast } from "react-toastify";



export default function OTPPageForgot() {
  const navigate = useNavigate();
  const [somethingwentwrong, setSomethingwentwrong] = useState(false);

  // Context to fetch user-related data
  const state = useContext(Basecontext);
  const { user, setUser, fetuser } = state;
  fetuser();

  // Extract query parameters from the URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const accounttype = queryParams.get("accounttype") || "tenant"; // Default to "tenant" if missing

  const respURL = `${config.backend}/api/forgotPassword/enterOTP/`;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(null);
  const inputRefs = useRef([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem("authtoken");
    if (savedToken) {
      setToken(savedToken);
    }
    setLoading(false); // Set loading to false once the token is loaded
  }, []);

  // Handle OTP input changes
  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return; // Allow only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Automatically focus the next input field
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP inputs
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      setMessage("Loading... Please wait.");
      return;
    }

    if (!token) {
      setMessage("Authentication token is missing. Please try again.");
      return;
    }

    const enteredOTP = otp.join(""); // Combine OTP digits into a single string

    if (enteredOTP.length !== 6) {
      setMessage("Please enter a complete 6-digit OTP.");
      setSuccess(false);
      return;
    }

    try {
      const response = await fetch(respURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authtoken: token,
          accounttype: accounttype,
        },
        body: JSON.stringify({
          Entered_OTP: enteredOTP,
          accounttype: accounttype,
        }),
      });
      const data = await response.json();

      if (data.success) {
        // Decode the token to extract the email
        const decodedToken = jwtDecode(token);
        const email = decodedToken.email; // Extract email from token
        setSuccess(data.success);
        setMessage(data.message);

        // Navigate to the "Set New Password" page with necessary params
        navigate(
          `/set-new-password?token=${token}&email=${email}&accounttype=${accounttype}`
        );
      } else {
        setMessage(data.message || "Failed to verify OTP.");
        setSuccess(false);
        setSomethingwentwrong(true);
      }
    } catch (error) {
      console.error("Network/Parsing Error:", error);
      setMessage("Network error or invalid server response. Please try again.");
      setSuccess(false);
      setSomethingwentwrong(true);
    }
  };

  // Handle errors and navigate back if something goes wrong
  useEffect(() => {
    if (somethingwentwrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1);
    }
  }, [somethingwentwrong]);

  return (
    <div className="otp-page-container">
      {/* Left section with image */}
      <div className="otp-page-image">
        <img src={logo} alt="OTP Illustration" />
      </div>

      {/* Right section with OTP form */}
      <div className="otp-page-form-container">
        <h2 className="otp-page-title">Verify OTP</h2>
        <div className="otp-text-input">
          <div>
            {message && (
              <p
                className={`otp-page-message ${success ? "otp-page-success" : "otp-page-error"
                  }`}
              >
                {message}
              </p>
            )}
          </div>
          <p className="otp-page-instruction">Enter OTP</p>
          <form onSubmit={handleSubmit}>
            <div className="otp-page-input-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  maxLength={1}
                  className="otp-page-input"
                />
              ))}
            </div>
            <button type="submit" className="otp-page-submit-btn">
              Verify OTP
            </button>
          </form>
        </div>
        <footer className="otp-page-footer">
          With Roomble, you'll stumble on the perfect place to rumble.
        </footer>
      </div>
    </div>
  );
}
