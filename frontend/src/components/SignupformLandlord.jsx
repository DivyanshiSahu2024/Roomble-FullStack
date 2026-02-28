/**
 * This component handles the landlord signup process. It validates user input,
 * sends the data to the backend API, and navigates to the OTP page upon successful registration.
 */

import { responsiveFontSizes } from "@mui/material";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import { toast } from "react-toastify";
import { useEffect } from "react";

function SignupformLandlord({ setID }) {
  const navigate = useNavigate();

  const [somethingwentwrong, setSomethingwentwrong] = useState(false);
  const [loading, setLoading] = useState(false);
  // Handle navigation and error notification if something goes wrong
  useEffect(() => {
    if (localStorage.getItem("authtoken")) {
      navigate("/"); // Redirect to the home page if already logged in
    }
    if (somethingwentwrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1); // Navigate back to the previous page
    }
  }, [somethingwentwrong]);

  const [formInput, setFormInput] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formError, setFormError] = useState({
    password: "",
    confirmPassword: "",
  });

  // Handles user input and updates the form state
  const handleUserInput = (name, value) => {
    setFormInput((prev) => ({ ...prev, [name]: value }));
  };

  // Validates the form input before submission
  const validateFormInput = async (event) => {
    event.preventDefault();
    let inputError = {
      confirmPassword: "",
    };

    // Validate password length
    if (formInput.password.length < 6) {
      setFormError({
        ...inputError,
        password: "Password should be at least 6 characters",
      });
      return;
    }
    if (formInput.password.length > 10) {
      setFormError({
        ...inputError,
        password: "Password should not be more than 10 characters",
      });
      return;
    }

    // Validate password and confirm password match
    if (formInput.password !== formInput.confirmPassword) {
      setFormError({
        ...inputError,
        confirmPassword: "Password and Confirm password do not match!",
      });
      return;
    }

    // If validation passes, send data to the API
    await sendDataToAPI();
  };

  // Sends the form data to the backend API
  const sendDataToAPI = async () => {
    const apiURL = `${config.backend}/api/Landlord/auth/Landlord_register`;

    const requestData = {
      name: formInput.name,
      email: formInput.email,
      password: formInput.password,
    };
    setLoading(true); // Set loading state to true
    try {
      const response = await fetch(apiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();
      setLoading(false); // Set loading state to false
      if (responseData.success) {
        setFormInput((prev) => ({ ...prev, successMsg: responseData.message }));
        setID(responseData.message); // Set the user ID for further steps
        navigate("/otp-page-landlord"); // Navigate to the OTP page
      } else {
        setFormInput((prev) => ({ ...prev, successMsg: responseData.message }));
      }
    } catch (error) {
      setLoading(false); // Set loading state to false
      console.error("Error sending data:", error);
      setSomethingwentwrong(true); // Handle errors gracefully
      setFormInput((prev) => ({
        ...prev,
        successMsg: "Couldn't fetch data.",
      }));
    }
  };

  return (
    <div className="LSignup-box">
      <h2 className="LTitle">Signup as a Landlord</h2>

      {/* Form for landlord signup */}
      <form className="LSignup-form" onSubmit={validateFormInput}>
        <div>
          <label>Full Name</label>
          <input
            type="text"
            className="LInput-box"
            placeholder="Enter your full name"
            required
            name="name"
            onChange={({ target }) =>
              handleUserInput(target.name, target.value)
            }
          />
        </div>

        <div>
          <label>Email Address</label>
          <input
            type="email"
            className="LInput-box"
            placeholder="mail@abc.com"
            name="email"
            onChange={({ target }) =>
              handleUserInput(target.name, target.value)
            }
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            className="LInput-box"
            placeholder="Enter password between 6 and 10 characters"
            name="password"
            value={formInput.password}
            onChange={({ target }) => {
              handleUserInput(target.name, target.value);

              // Validate password length dynamically
              if (target.value.length < 6) {
                setFormError((prev) => ({
                  ...prev,
                  password: "Password must be at least 6 characters.",
                }));
              } else if (target.value.length > 10) {
                setFormError((prev) => ({
                  ...prev,
                  password: "Password must not exceed 10 characters.",
                }));
              } else {
                setFormError((prev) => {
                  const { password, ...rest } = prev;
                  return rest;
                });
              }
            }}
            required
          />
          {formError.password && (
            <p className="signup-landlord-error">{formError.password}</p>
          )}
        </div>

        <div>
          <label>Confirm Password</label>
          <input
            type="password"
            className="LInput-box"
            placeholder="Re-enter the same password"
            name="confirmPassword"
            value={formInput.confirmPassword}
            onChange={({ target }) => {
              handleUserInput(target.name, target.value);

              // Validate confirm password dynamically
              if (target.value.length < 6) {
                setFormError((prev) => ({
                  ...prev,
                  confirmPassword:
                    "Confirm password must be at least 6 characters.",
                }));
              } else if (target.value.length > 10) {
                setFormError((prev) => ({
                  ...prev,
                  confirmPassword:
                    "Confirm password must not exceed 10 characters.",
                }));
              } else if (target.value !== formInput.password) {
                setFormError((prev) => ({
                  ...prev,
                  confirmPassword:
                    "Password and Confirm password do not match.",
                }));
              } else {
                setFormError((prev) => {
                  const { confirmPassword, ...rest } = prev;
                  return rest;
                });
              }
            }}
            required
          />
          {formError.confirmPassword && (
            <p className="signup-landlord-error">{formError.confirmPassword}</p>
          )}

          <p className="signup-landlord-error">{formInput.successMsg}</p>
        </div>
        <button className="LSignup-button" disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>

      <p className="LFooter-text-signup">
        With Roomble, you'll stumble on the perfect place to rumble!
      </p>
    </div>
  );
}

export default SignupformLandlord;
