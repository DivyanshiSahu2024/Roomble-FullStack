/**
 * LandlordProfile Component
 *
 * This component is responsible for displaying the profile of a landlord, including their personal details
 * (such as name, email, and profile picture) and a list of properties they own. It also provides functionality
 * for editing the profile, logging out, and navigating back in case of errors.
 *
 */

import React, { useEffect, useState } from "react";
import "../../css/LandlordProfileStyles/LandlordProfile.css";
import PropertyCard from "../LandlordDashboard/PropertyCard.jsx";
import { useNavigate } from "react-router-dom";
import config from "../../config.json";
import { toast } from "react-toastify";

const LandlordProfile = () => {
  const [respData, setRespData] = useState(null);
  const [somethingwentwrong, setSomethingwentwrong] = useState(false);
  const navigate = useNavigate();
  // Redirect to login if authtoken is not present
  useEffect(() => {
    const token = localStorage.getItem("authtoken");
    if (!token) {
      navigate("/login"); // Redirect to login page
    }
  }, [navigate]);

  // Navigate to edit page
  const handleSubmit = () => {
    navigate("/landlord-edit-page");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  const token = localStorage.getItem("authtoken");

  // Fetch landlord profile data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(token);
        const response = await fetch(
          `${config.backend}/api/view_profiles/Self_profile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authtoken: token, // Send auth token
              accounttype: "landlord", // Send account type
            },
            body: JSON.stringify({ ngj: "bkjmhkn" }),
          }
        );
        const data = await response.json();
        setRespData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSomethingwentwrong(true);
      }
    };

    fetchData();
  }, []);

  // Handle error state
  useEffect(() => {
    if (somethingwentwrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1);
    }
  }, [somethingwentwrong]);

  if (!respData) {
    return <div className="landlord-profile-loading">Loading...</div>;
  }

  console.log(respData.Images);

  return (
    <div className="landlord-profile-container">
      {/* Profile Section */}
      <div className="landlord-profile-content">
        <div className="landlord-profile-header">
          <img
            src={respData.Images}
            alt="Profile"
            className="landlord-profile-image"
          />
          <div className="landlord-profile-details">
            <div className="landlord-profile-item">
              <div className="landlord-profile-name">
                <p>
                  <span className="label">Full Name</span>{" "}
                  <span className="separator">:</span>
                  <span className="value">{respData.name}</span>
                </p>
              </div>
              <div className="landlord-profile-email">
                <p>
                  <span className="label">Email Address</span>{" "}
                  <span className="separator">:</span>
                  <span className="value">{respData.email}</span>
                </p>
              </div>
              <div className="landlord-profile-propCount">
                <p>
                  <span className="label">Properties Count</span>{" "}
                  <span className="separator">:</span>
                  <span className="value">{respData.message}</span>
                </p>
              </div>
              <div className="landlord-profile-buttons">
                <button
                  className="landlord-profile-edit-button"
                  onClick={handleSubmit}
                >
                  Edit
                </button>
                <button
                  className="landlord-profile-logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>

                {/* <button
                  className="landlord-profile-delete-button"
                  onClick={handleDelete}
                >
                  Delete
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="landlord-profile-properties">
          {respData.Properties.map(
            ({ _id, town, bhk, price, Images, available, city }) => (
              <PropertyCard
                key={_id}
                image={Images[0]}
                price={price}
                location={`${town}, ${city}`}
                bhk={bhk}
                id={_id}
                available={available}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default LandlordProfile;
