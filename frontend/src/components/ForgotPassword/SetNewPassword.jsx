
/**
* This page allows users to reset their password by entering a new password and confirming it.
* It validates the input, sends a request to the backend to update the password, and handles errors or success responses.
*/
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import "../../css/ForgotPassword/SetNewPassword.css";
import logo from "../../../public/logo.png";
import config from "../../config.json";
import { toast } from "react-toastify";

const SetNewPassword = () => {
  // State variables for form inputs, error messages, and loading state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [somethingwentwrong, setSomethingwentwrong] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract query parameters from the URL
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const accounttype = searchParams.get("accounttype");

  // Redirect to the forgot-password page if required query parameters are missing
  useEffect(() => {
    if (!token || !email || !accounttype) {
      setError("Invalid or missing authentication details.");
      navigate("/forgot-password");
    }
  }, [token, email, accounttype, navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate that the passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Send a POST request to the backend to reset the password
      const response = await fetch(
        `${config.backend}/api/forgotPassword/ForgotPassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authtoken: token, // Include the token in the headers
            accounttype: accounttype, // Include the account type in the headers
          },
          body: JSON.stringify({
            email,
            newPassword,
            accounttype,
          }),
        }
      );

      const data = await response.json();

      // Handle success or failure response from the server
      if (data.success) {
        alert("Password reset successful!");
        navigate("/login");
      } else {
        setError(data.message || "Failed to reset password.");
        setSomethingwentwrong(true);
      }
    } catch (error) {
      // Handle network or parsing errors
      console.error("Network/Parsing Error:", error);
      setError(`Network error: ${error.message}`);
      setSomethingwentwrong(true);
    } finally {
      setLoading(false);
    }
  };

  // Show a toast notification and navigate back if something went wrong
  useEffect(() => {
    if (somethingwentwrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1);
    }
  }, [somethingwentwrong, navigate]);

  <p className="register-text">
    "Not Registered Yet"? <Link to="/signup-tenant">Sign up</Link>
  </p>
};

export default SetNewPassword;
