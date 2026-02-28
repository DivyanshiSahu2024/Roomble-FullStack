/**
 * This component allows tenants to edit their profile information. It includes
 * fields for personal details, preferences, and profile picture upload. The form
 * data is submitted to the backend for updating the tenant's profile.
 */

import React, { useEffect, useState, useContext } from "react";
import "../../css/TenantProfilePageStyles/TenantEditPage.css";
import logo from "../../../public/sampleUser_img.png";
import { Basecontext } from "../../context/base/Basecontext";
import { useNavigate } from "react-router-dom";
import config from "../../config.json";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const TenantEditPage = () => {
  const navigate = useNavigate();
  const state = useContext(Basecontext);
  const { user, setUser, fetuser } = state;

  // Redirect to login if authtoken is not present
  useEffect(() => {
    const token = localStorage.getItem("authtoken");
    if (!token) {
      navigate("/login"); // Redirect to login page
    } else {
      fetuser(); // Fetch user data if token exists
    }
  }, [navigate, fetuser]);

  const [file, setFile] = useState(null);
  const token = localStorage.getItem("authtoken");
  const [somethingwentwrong, setSomethingwentwrong] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: state.user.name,
    email: state.user.email,
    gender: state.user.gender ? "Male" : "Female",
    city: state.user.city,
    locality: state.user.locality,
    smoke: state.user.smoke,
    veg: state.user.veg,
    pets: state.user.pets,
    flatmate: state.user.flatmate,
    description: state.user.description,
    accounttype: state.user.type,
    remove: "",
  });

  // Handle error state
  useEffect(() => {
    if (somethingwentwrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1);
    }
  }, [somethingwentwrong]);

  // Update form data when user state changes
  useEffect(() => {
    setFormData({
      name: state.user.name,
      email: state.user.email,
      gender: state.user.gender ? "Male" : "Female",
      city: state.user.city,
      locality: state.user.locality,
      smoke: state.user.smoke,
      veg: state.user.veg,
      pets: state.user.pets,
      flatmate: state.user.flatmate,
      description: state.user.description,
      accounttype: state.user.type,
      remove: "",
    });
    console.log(state.user);
  }, [user]);

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Show popup when user clicks on the email field
  const handleEmailClick = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Not Editable",
      text: "You can't edit your email.",
      icon: "info",
      confirmButtonText: "Ok",
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    const formDataCopy = new FormData();

    // Append text fields to FormData
    Object.keys(formData).forEach((key) => {
      if (key === "gender") {
        formDataCopy.append(key, formData[key] === "Male" ? true : false);
      } else {
        formDataCopy.append(key, formData[key]);
      }
    });

    // Append the file (if any)
    if (file) {
      formDataCopy.append("image", file);
    }

    try {
      const response = await fetch(
        `${config.backend}/api/updates/updateProfile`,
        {
          method: "POST",
          body: formDataCopy,
          headers: {
            authtoken: token,
            accounttype: "tenant",
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        console.log("Form submitted successfully");
        navigate("/tenant-profile-page");
        window.location.reload();
      } else {
        console.error("Failed to submit form");
        setSomethingwentwrong(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setSomethingwentwrong(true);
    }
  };

  return (
    <div className="tenant-edit-container">
      {/* Header Section */}
      <div className="tenant-edit-info">
        <h1>Edit Profile</h1>
      </div>

      <div className="tenant-edit-header">
        <div className="tenant-edit-profile">
          <label htmlFor="image_input">
            <img
              src={state.user.Images || "https://via.placeholder.com/80"}
              alt="Profile"
              className="tenant-edit-profile-img"
            />
          </label>
          <input
            type="file"
            id="image_input"
            accept="image/png, image/gif, image/jpeg, image/jpg"
            onChange={(e) => {
              setFile(e.target.files[0]);
            }}
          />
        </div>
        <button className="tenant-edit-btn" onClick={handleSubmit}>
          Done
        </button>
      </div>

      {/* Form Section */}
      <div className="tenant-edit-form">
        {/* Left Side */}
        <div className="tenant-edit-left">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />

          <label>Email Address</label>
          <input
            type="email"
            value={formData.email}
            name="email"
            onClick={handleEmailClick}
            readOnly
          />

          <label>Gender</label>
          <select
            name="gender"
            onChange={handleInputChange}
            value={formData.gender === "Male" ? "Male" : "Female"}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Choices Section */}
          <div className="tenant-edit-choices">
            {/* Smoke/Drink */}
            <div className="tenant-edit-choices-smoke">
              <label>Do you drink/smoke?</label>
              <div className="edit-smoke-btn">
                <button
                  className={formData.smoke ? "active" : ""}
                  onClick={() => setFormData({ ...formData, smoke: true })}
                >
                  YES
                </button>
                <button
                  className={!formData.smoke ? "active" : ""}
                  onClick={() => setFormData({ ...formData, smoke: false })}
                >
                  NO
                </button>
              </div>
            </div>

            {/* Food Preferences */}
            <div className="tenant-edit-choices-veg">
              <label>Food Preferences</label>
              <div className="edit-veg-btn">
                <button
                  className={formData.veg ? "active" : ""}
                  onClick={() => setFormData({ ...formData, veg: true })}
                >
                  VEG
                </button>
                <button
                  className={!formData.veg ? "active" : ""}
                  onClick={() => setFormData({ ...formData, veg: false })}
                >
                  NON-VEG
                </button>
              </div>
            </div>

            {/* Flatmate */}
            <div className="tenant-edit-choices-flatmate">
              <label>Are you seeking flatmates?</label>
              <div className="edit-flatmate-btn">
                <button
                  className={formData.flatmate ? "active" : ""}
                  onClick={() => setFormData({ ...formData, flatmate: true })}
                >
                  YES
                </button>
                <button
                  className={!formData.flatmate ? "active" : ""}
                  onClick={() => setFormData({ ...formData, flatmate: false })}
                >
                  NO
                </button>
              </div>
            </div>

            {/* Pets */}
            <div className="tenant-edit-choices-pets">
              <label>Do you have pets?</label>
              <div className="edit-pets-btn">
                <button
                  className={formData.pets ? "active" : ""}
                  onClick={() => setFormData({ ...formData, pets: true })}
                >
                  YES
                </button>
                <button
                  className={!formData.pets ? "active" : ""}
                  onClick={() => setFormData({ ...formData, pets: false })}
                >
                  NO
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="tenant-edit-right">
          <label>City</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleInputChange}
          >
            <option value="Mumbai">Mumbai</option>
          </select>

          <label>Locality</label>
          <select
            name="locality"
            value={formData.locality}
            onChange={handleInputChange}
          >
            <option value="">Select Location</option>
            <option value="Andheri">Andheri</option>
            <option value="Bandra">Bandra</option>
            <option value="Juhu">Juhu</option>
            <option value="Malad">Malad</option>
            <option value="Kandivali">Kandivali</option>
            <option value="Borivali">Borivali</option>
            <option value="Dahisar">Dahisar</option>
            <option value="Mira Road">Mira Road</option>
            <option value="Thane">Thane</option>
            <option value="Goregaon">Goregaon</option>
          </select>

          <span>About Me</span>
          <textarea
            type="text"
            id="briefIntro"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default TenantEditPage;
