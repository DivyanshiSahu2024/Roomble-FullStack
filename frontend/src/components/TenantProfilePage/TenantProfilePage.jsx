/**
 * This component renders the profile page for a tenant, displaying their personal details,
 * preferences, and other relevant information. It allows the user to view their profile,
 * edit their details, or log out of the application.
 */

import React, { useState, useRef, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaw,
  faLeaf,
  faDrumstickBite,
  faWineGlassAlt,
  faBan,
  faMars,
  faVenus,
  faTimes,
  faCheck,
} from "@fortawesome/free-solid-svg-icons"; // Import icons
import logo from "../../../public/sampleUser_img.png";
import "../../css/TenantProfilePageStyles/TenantProfilePage.css"; // Import the CSS specific to this component
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Basecontext } from "../../context/base/Basecontext";

export default function TenantProfilePage() {
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

  // Navigate to the edit page
  const handleSubmit = () => {
    navigate("/tenant-edit-page");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="tenant-profile-container">
      {/* Left Column */}
      <div className="tenant-profile-left-column">
        <img
          src={state.user.Images}
          alt="Profile"
          className="tenant-profile-photo"
        />
        <div className="tenant-bio-class">
          <p className="tenant-profile-bio">
            {state.user.description ===
              "This user hasn't setup a description yet" ||
            state.user.description === ""
              ? "You have not set up a description yet"
              : state.user.description}
          </p>
        </div>
      </div>

      {/* Right Column */}
      <div className="tenant-profile-right-column">
        <div className="tenant-profile-details">
          {/* Name */}
          <div className="tenant-profile-name">
            <p>
              <span>Name</span>
              <span>:</span>
              <span>{state.user.name}</span>
            </p>
          </div>

          {/* Email */}
          <div className="tenant-profile-mail">
            <p>
              <span>Email</span>
              <span>:</span>
              <span>{state.user.email}</span>
            </p>
          </div>

          {/* City */}
          <div className="tenant-profile-city">
            <p>
              <span>City</span>
              <span>:</span>
              <span>{state.user.city}</span>
            </p>
          </div>

          {/* Locality */}
          <div className="tenant-profile-locality">
            <p>
              <span>Locality</span>
              <span>:</span>
              <span>{state.user.locality}</span>
            </p>
          </div>

          {/* Gender */}
          <div className="tenant-profile-gender">
            <p>
              <span>Gender</span>
              <span>:</span>
              <span>
                {state.user.gender ? (
                  <>
                    Male{" "}
                    <FontAwesomeIcon
                      icon={faMars}
                      style={{ color: "#7D141D", marginLeft: "5px" }}
                    />
                  </>
                ) : (
                  <>
                    Female{" "}
                    <FontAwesomeIcon
                      icon={faVenus}
                      style={{ color: "#7D141D", marginLeft: "5px" }}
                    />
                  </>
                )}
              </span>
            </p>
          </div>

          {/* Flatmate */}
          <div className="tenant-profile-flatmate">
            <p>
              <span>Are you seeking a flatmate?</span>
              <span>:</span>
              <span>
                {state.user.flatmate ? (
                  <>
                    Yes{" "}
                    <FontAwesomeIcon
                      icon={faCheck}
                      style={{ color: "#7D141D", marginLeft: "5px" }}
                    />
                  </>
                ) : (
                  <>
                    No{" "}
                    <FontAwesomeIcon
                      icon={faTimes}
                      style={{ color: "#7D141D", marginLeft: "5px" }}
                    />
                  </>
                )}
              </span>
            </p>
          </div>

          {/* Smoke/Drink */}
          <div className="tenant-profile-smoke">
            <p>
              <span>Do you drink/smoke?</span>
              <span>:</span>
              <span>
                {state.user.smoke ? (
                  <>
                    Yes{" "}
                    <FontAwesomeIcon
                      icon={faWineGlassAlt}
                      style={{ color: "#7D141D", marginLeft: "5px" }}
                    />
                  </>
                ) : (
                  <>
                    No{" "}
                    <FontAwesomeIcon
                      icon={faBan}
                      style={{ color: "#7D141D", marginLeft: "5px" }}
                    />
                  </>
                )}
              </span>
            </p>
          </div>

          {/* Food Preferences */}
          <div className="tenant-profile-veg">
            <p>
              <span>Food Preferences</span>
              <span>:</span>
              <span>
                {state.user.veg ? (
                  <>
                    Veg{" "}
                    <FontAwesomeIcon
                      icon={faLeaf}
                      style={{ color: "#7D141D", marginLeft: "5px" }}
                    />
                  </>
                ) : (
                  <>
                    Non-Veg{" "}
                    <FontAwesomeIcon
                      icon={faDrumstickBite}
                      style={{ color: "#7D141D", marginLeft: "5px" }}
                    />
                  </>
                )}
              </span>
            </p>
          </div>

          {/* Pets */}
          <div className="tenant-profile-pets">
            <p>
              <span>Do you have pets?</span>
              <span>:</span>
              <span>
                {state.user.pets ? (
                  <>
                    Yes{" "}
                    <FontAwesomeIcon
                      icon={faPaw}
                      style={{ color: "#7D141D", marginLeft: "5px" }}
                    />
                  </>
                ) : (
                  <>
                    No{" "}
                    <FontAwesomeIcon
                      icon={faBan}
                      style={{ color: "#7D141D", marginLeft: "5px" }}
                    />
                  </>
                )}
              </span>
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="tenant-profile-buttons">
          <button className="tenant-profile-edit-button" onClick={handleSubmit}>
            Edit
          </button>
          <button
            className="tenant-profile-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
