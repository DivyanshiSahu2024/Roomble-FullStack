/**
 * LandlordEditProfile Component
 *
 * This component allows landlords to edit their profile information, including their name and profile image.
 * The email address is displayed but cannot be edited for security reasons.
 * Users can upload a new profile image and update their name, which is then sent to the backend for processing.
 * If the update is successful, the user is redirected to their profile page.
 */

import React, { useEffect, useState, useContext } from "react";
import { Basecontext } from "../../context/base/Basecontext";
import { useNavigate } from "react-router-dom";
import config from "../../config.json";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "../../css/LandlordProfileStyles/LandlordEditProfile.css"; // Importing CSS for styling

const LandlordEditProfile = () => {
  const navigate = useNavigate();
  // Redirect to login if authtoken is not present
  useEffect(() => {
    const token = localStorage.getItem("authtoken");
    if (!token) {
      navigate("/login"); // Redirect to login page
    }
  }, [navigate]);

  const state = useContext(Basecontext); // Fetching context data
  const { user, setUser, fetuser } = state;
  fetuser(); // Fetch user data

  // State to store the selected file for profile image upload
  const [file, setFile] = useState(null);
  const token = localStorage.getItem("authtoken"); // Authentication token
  const [somethingwentwrong, setSomethingwentwrong] = useState(false); // Error state

  // State to manage form data
  const [formData, setFormData] = useState({
    name: state.user.name,
    email: state.user.email,
    accounttype: state.user.type,
    remove: "",
  });

  // Update form data when user data changes
  useEffect(() => {
    setFormData({
      name: state.user.name,
      email: state.user.email,
      accounttype: state.user.type,
      remove: "",
    });
  }, [user]);

  // Handle input changes in the form
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Prevent email editing and show an alert
  const handleEmailClick = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Not Editable",
      text: "You cannot edit your email address.",
      icon: "info",
      confirmButtonText: "Ok",
    });
  };

  // Handle errors and navigate back if something goes wrong
  useEffect(() => {
    if (somethingwentwrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1);
    }
  }, [somethingwentwrong]);

  // Handle form submission
  const handleSubmit = async () => {
    const formDataCopy = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataCopy.append(key, formData[key]);
    });
    if (file) {
      formDataCopy.append("image", file); // Append image file if selected
    }
    try {
      const response = await fetch(
        `${config.backend}/api/updates/updateProfile`,
        {
          method: "POST",
          body: formDataCopy,
          headers: {
            authtoken: token,
            accounttype: "landlord",
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        navigate("/landlord-profile-page"); // Navigate to profile page on success
        window.location.reload(); // Reload the page
      } else {
        setSomethingwentwrong(true); // Set error state
      }
    } catch (error) {
      setSomethingwentwrong(true); // Handle network or server errors
    }
  };

  return (
    <div className="landlord-edit-container">
      {/* Header section with profile image and user info */}
      <div className="landlord-edit-header">
        <label htmlFor="image_input" className="image-wrapper">
          <img
            src={state.user.Images || "https://via.placeholder.com/200"} // Display profile image or placeholder
            alt="Profile"
            className="landlord-edit-profile-img"
          />
        </label>
        <input
          type="file"
          id="image_input"
          accept="image/png, image/gif, image/jpeg, image/jpg"
          onChange={(e) => {
            setFile(e.target.files[0]); // Set selected file
          }}
        />
        <div className="landlord-edit-info">
          <h2>{state.user.name}</h2>
          <p>{state.user.email}</p>
        </div>
      </div>

      {/* Form section for editing profile */}
      <div className="landlord-edit-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter new name"
            value={formData.name}
            onChange={handleInputChange} // Handle name input change
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onClick={handleEmailClick} // Prevent email editing
            readOnly
          />
        </div>

        <button className="landlord-edit-btn" onClick={handleSubmit}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default LandlordEditProfile;
