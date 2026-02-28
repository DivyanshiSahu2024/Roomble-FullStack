/**
 * HomePage.jsx
 * This component represents the homepage of the landlord dashboard.
 * It fetches and displays a list of properties owned by the landlord.
 * If no properties are available, it shows a placeholder message.
 * The page also handles loading states and error scenarios.
 */
import React, { useEffect, useState } from "react";
import PropertyCard from "./PropertyCard";
import "../../css/LandlordDashboard.css";
import config from "../../config.json";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [Properties, setProperties] = useState([]); // State to store properties
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State to handle errors
  const [somethingwentwrong, setSomethingwentwrong] = useState(false); // State for unexpected errors
  const navigate = useNavigate();
  // Redirect to login if authtoken is not present
  useEffect(() => {
    const token = localStorage.getItem("authtoken");
    if (!token) {
      navigate("/login"); // Redirect to login page
    }
  }, [navigate]);

  // Fetch properties when the component mounts
  useEffect(() => {
    const fetchProperties = async () => {
      const token = localStorage.getItem("authtoken");
      try {
        const response = await fetch(
          `${config.backend}/api/view_profiles/Self_profile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authtoken: token,
              accounttype: "landlord",
            },
          }
        );
        const data = await response.json();
        if (!data.success) setSomethingwentwrong(true); // Handle unsuccessful response
        setProperties(data.Properties); // Set properties data
      } catch (error) {
        setError(error); // Set error state
        setSomethingwentwrong(true); // Handle unexpected errors
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    fetchProperties();
  }, []);

  // Navigate back and show error toast if something went wrong
  useEffect(() => {
    if (somethingwentwrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1);
    }
  }, [somethingwentwrong]);

  // Transform properties data for rendering
  const propertyList = Properties.map((item) => ({
    title: "Flat",
    image: item.Images[0],
    price: item.price,
    bhk: item.bhk,
    location: item.town,
    id: item._id,
    available: item.available,
  }));

  return (
    <div className="landlord-dashboard-container">
      {/* Header Section */}
      <div className="landlord-dashboard-header">
        <h1>Your Properties</h1>
        <div className="landlord-dashboard-underline" />
      </div>

      {/* Main Content */}
      {loading ? (
        // Show loading spinner
        <div className="landlord-dashboard-loading-text">
          Loading properties...
        </div>
      ) : propertyList.length === 0 ? (
        // Show placeholder if no properties are available
        <div className="landlord-dashboard-no-properties-wrapper">
          <div className="landlord-dashboard-no-properties">
            <img
              src="./house_when_page_empty.png"
              alt="No properties"
              className="landlord-dashboard-empty-image"
            />
            <h2 className="landlord-dashboard-empty-title">
              No Properties Yet
            </h2>
            <p className="landlord-dashboard-empty-subtitle">
              Looks like you haven’t added any properties. <br />
              Start listing to see them here!
            </p>
          </div>
        </div>
      ) : (
        // Render property cards
        <div className="landlord-dashboard-property-grid">
          {propertyList.map((property, index) => (
            <PropertyCard
              key={index}
              {...property}
              onView={() => console.log(`Viewing ${property.title}`)}
              onDelete={() => console.log(`Deleting ${property.title}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
