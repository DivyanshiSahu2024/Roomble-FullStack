
/**
 * OTPPage component handles the OTP verification process for account deletion.
 * It allows users to input a 6-digit OTP, validates it, and sends it to the backend for verification.
 * On successful verification, the account is deleted, and the user is redirected to the login page.
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../css/OTPPage/OTPPageTenant.css";
import logo from "../../../public/logo.png";
import config from "../../config.json";
import { toast } from "react-toastify";

export default function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email and account type from navigation state
  const { email, accountType } = location.state || {};

  // State variables
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // OTP input values
  const [message, setMessage] = useState(""); // Message to display success/error
  const [success, setSuccess] = useState(null); // Success state
  const [somethingWentWrong, setSomethingWentWrong] = useState(false); // Error state

  // Refs for OTP input fields
  const inputRefs = useRef([]);

  // Effect to handle error state
  useEffect(() => {
    if (somethingWentWrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1); // Navigate back to the previous page
    }
  }, [somethingWentWrong, navigate]);

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return; // Allow only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus on the next input field if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation between input fields
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const enteredOTP = otp.join(""); // Combine OTP digits into a single string

    // Validate OTP length
    if (enteredOTP.length !== 6) {
      setMessage("Please enter a complete 6-digit OTP.");
      setSuccess(false);
      return;
    }

    try {
      const token = localStorage.getItem("deleteToken"); // Retrieve delete token from localStorage
      if (!token) {
        setMessage("No delete token found. Please try again.");
        setSuccess(false);
        return;
      }

      // Send OTP verification request to the backend
      const response = await fetch(
        `${config.backend}/api/Deleting_routes/enterOTPtoDelete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authtoken: token, // Send delete token
            accounttype: accountType, // Send account type
          },
          body: JSON.stringify({
            Entered_OTP: enteredOTP,
            accounttype: accountType,
          }),
        }
      );

      const data = await response.json();
      setMessage(data.message);
      setSuccess(data.success);

      // Handle successful OTP verification
      if (data.success) {
        alert("Account deleted successfully.");
        localStorage.removeItem("deleteToken"); // Clear delete token
        localStorage.removeItem("token"); // Clear user token
        navigate("/login"); // Redirect to login page
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong. Please try again.");
      setSuccess(false);
      setSomethingWentWrong(true); // Trigger error state
    }
  };

  return (
    <div className="otp-page-container">
      {/* Left section with image */}
      <div className="otp-page-image">
        <img src={logo} alt="OTP Illustration" />
      </div>

      {/* Right section with OTP form */}
      <div className="otp-page-form-container">
        <h2 className="otp-page-title">Verify OTP for Deletion</h2>
        <div className="otp-text-input">
          {/* Display success or error message */}
          {message && (
            <p
              className={`otp-page-message ${
                success ? "otp-page-success" : "otp-page-error"
              }`}
            >
              {message}
            </p>
          )}
          <p className="otp-page-instruction">Enter the OTP sent to {email}</p>
          <form onSubmit={handleSubmit}>
            <div className="otp-page-input-container">
              {/* Render OTP input fields */}
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
