
/**
 * This component renders an OTP verification page for tenants. It includes an OTP input form,
 * handles OTP input validation, and sends the entered OTP to the backend for verification.
 * On successful verification, it navigates the user to the login page.
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/OTPPage/OTPPageTenant.css"; // Import the CSS specific to this component
import logo from "../../../public/logo.png";
import config from "../../config.json";

export default function OTPPageTenant({ id }) {
  const navigate = useNavigate();
  const respURL = `${config.backend}/api/Tenant/auth/verifyTenant/${id}`;

  // State to store OTP digits
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState(""); // Message to display success or error
  const [success, setSuccess] = useState(null); // Success state
  const inputRefs = useRef([]); // Refs for OTP input fields

  // Handle input change for OTP fields
  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return; // Allow only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to the next input field if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace key to move focus to the previous input field
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOTP = otp.join("");

    // Validate OTP length
    if (enteredOTP.length !== 6) {
      setMessage("Please enter a complete 6-digit OTP.");
      setSuccess(false);
      return;
    }

    try {
      // Send OTP to the backend for verification
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
        <div className="otp-text-input">
          {/* Display success or error message */}
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
          <form onSubmit={handleSubmit}>
            {/* OTP input fields */}
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

            {/* Submit button */}
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
