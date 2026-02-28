
/**
 * PropertyCard Component
 * This component represents a card that displays details of a property.
 * It includes an image, price, location, BHK details, and a button to view more details.
 * If the property is not available, it is visually marked as "delisted".
 */

import React, { useState } from "react";
import "../../css/PropertyCard.css";
import { useNavigate } from "react-router-dom";


const PropertyCard = ({
  image,    
  price,    
  title,    
  location, 
  bhk,      
  id,       
  available 
}) => {

  // Hook to programmatically navigate between routes
  const navigate = useNavigate();

  // Function to handle the "View" button click
  const handleView = () => {
    // Navigate to the property details page using the property ID
    navigate(`/property/${id}`);
  };

  return (
    <div className={`property-card ${available ? "" : "delisted"}`}>
      {/* Image Section */}
      <div className="image-container">
        <img src={image} alt="Property" />
      </div>

      {/* Details Section */}
      <div className="details">
        <p className="price">Price : {price}</p>
        <p className="description">
          {location}
        </p>
        <p className="bhk">BHK : {bhk}</p>
      </div>

      {/* Buttons Section */}
      <div className="buttons">
        {/* View button is disabled and styled differently if the property is delisted */}
        <button className={`view-button ${available ? "" : "delisted"}`} onClick={handleView}>
          View
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
