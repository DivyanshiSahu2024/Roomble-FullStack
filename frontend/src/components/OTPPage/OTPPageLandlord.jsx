/**
 * OTPPageTenant Component
 *
 * This component renders an OTP verification page for landlords. It allows users to input a 6-digit OTP,
 * validates the input, and submits it to the backend for verification. On successful verification, the user
 * is redirected to the login page.
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/OTPPage/OTPPageLandlord.css"; // Import the CSS specific to this component
import config from "../../config.json";
import { toast } from "react-toastify";
import logo from "../../../public/logo.png"; // Import the logo image

export default function OTPPageTenant({ id }) {
  const navigate = useNavigate();

  // Backend API URL for OTP verification
  const respURL = `${config.backend}/api/Landlord/auth/verifyLandlord/${id}`;

  // State variables
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // Array to store OTP digits
  const [message, setMessage] = useState(""); // Message to display success or error
  const [success, setSuccess] = useState(null); // Success state
  const [somethingwentwrong, setSomethingwentwrong] = useState(false); // Error state
  const inputRefs = useRef([]); // References for OTP input fields

  // Effect to handle navigation on error
  useEffect(() => {
    if (somethingwentwrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1); // Navigate back to the previous page
    }
  }, [somethingwentwrong, navigate]);

  // Handle OTP input change
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
    if (enteredOTP.length !== 6) {
      setMessage("Please enter a complete 6-digit OTP.");
      setSuccess(false);
      return;
    }

    try {
      const response = await fetch(respURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Entered_OTP: enteredOTP }),
      });

      const data = await response.json();
      setMessage(data.message);
      setSuccess(data.success);

      // Navigate to login page on success
      if (data.success) {
        navigate("/login");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
      setSuccess(false);
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
        <h2 className="otp-page-title">Verify OTP</h2>

        {/* Display success or error message */}
        <div className="otp-text-input">
          <div>
            {message && (
              <p
                className={`otp-page-message ${
                  success ? "otp-page-success" : "otp-page-error"
                }`}
              >
                {message}
              </p>
            )}
          </div>

          <p className="otp-page-instruction">Enter OTP</p>

          {/* OTP input form */}
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

        {/* Footer */}
        <footer className="otp-page-footer">
          With Roomble, you'll stumble on the perfect place to rumble.
        </footer>
      </div>
    </div>
  );
}
