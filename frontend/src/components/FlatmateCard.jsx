
/**
 * This component represents a card UI for displaying information about a flatmate.
 * It includes details such as name, location, compatibility score, and options to bookmark or view the flatmate's profile.
 */

import React, { useState, useEffect, useContext } from "react";
import "../css/FlatMateCard.css";
import { Basecontext } from "../context/base/Basecontext";
import Swal from "sweetalert2";
import config from "../config.json";

const FlatmateCard = ({ 
  id, 
  name, 
  locality, 
  city, 
  gender, 
  smoke, 
  eatNonVeg, 
  pets, 
  compatibilityScore, 
  image, 
  isBookmarked,
  onBookmarkToggle,
  help
}) => {
  // State to manage the bookmark status
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  // Access user context
  const { user } = useContext(Basecontext);

  // Update the bookmarked state when the prop changes
  useEffect(() => {
    setBookmarked(isBookmarked);
  }, [isBookmarked]);

  // Handle bookmark button click
  const handleBookmarkClick = async () => {
    if (help) {
      // If 'help' is true, use the parent's onBookmarkToggle function
      await onBookmarkToggle();
    } else {
      // If 'help' is false, use the local toggleBookmark function
      await toggleBookmark();
    }
  };

  // Function to toggle bookmark state
  const toggleBookmark = async () => {
    // Show confirmation popup
    const confirmPopup = await Swal.fire({
      title: "Toggle Bookmark?",
      text: `Are you sure you want to ${bookmarked ? "remove" : "add"} this bookmark?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#8b1e2f",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    // Exit if the user cancels the action
    if (!confirmPopup.isConfirmed) return;

    // Determine the new bookmark state
    const newBookmarkState = !bookmarked;

    // Retrieve the authentication token
    const token = localStorage.getItem("authtoken");

    // Prepare the request body
    const requestBody = {
      action: newBookmarkState ? "bookmark" : "unmark",
      thing: "flatmate",
      id,
    };

    // Check if the token is missing
    if (!token) {
      alert("Authentication token is missing!");
      return;
    }

    try {
      // Send the request to the backend
      const response = await fetch(`${config.backend}/api/Bookmarking_Routes/edit_bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authtoken: token,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      // Handle errors from the response
      if (!response.ok) {
        throw new Error(data.message || "Failed to update bookmark");
      }

      // Update the bookmark state
      setBookmarked(newBookmarkState);
    } catch (error) {
      console.error("Error updating bookmark:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Handle the "View" button click
  const handleView = () => {
    window.location.href = `/tenant/${id}`;
  };

  // Calculate the compatibility score
  const score = Math.round(parseFloat(compatibilityScore) * 100) || 0;

  return (
    <div className="flatmate-card">
      {/* Card Header */}
      <div className="card-header">
        <img src={image} alt={name} className="profile-pic" />
        <span className="flatmate-name">{name}</span>
        <span className="compatibility-score">
          <span className="star-icon"> 🤝 </span> {score}%
        </span>
      </div>

      {/* Card Body */}
      <div className="card-body">
        <p className="location-title">Preferred Location</p>
        <p className="location-text">
          {locality}, {city}
        </p>
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        {/* Bookmark Button */}
        <button 
          className="bookmark-btn" 
          onClick={handleBookmarkClick}
        >
          {bookmarked ? (
            <svg width="40" height="40" viewBox="0 0 30 30" fill="#8b1e2f">
              <path d="M6 3c-1.1 0-2 .9-2 2v16l8-5 8 5V5c0-1.1-.9-2-2-2H6z"></path>
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 30 30" fill="none" stroke="#8b1e2f" strokeWidth="2">
              <path d="M6 3c-1.1 0-2 .9-2 2v16l8-5 8 5V5c0-1.1-.9-2-2-2H6z"></path>
            </svg>
          )}
        </button>

        {/* View Button */}
        <button className="view-btn" onClick={handleView}>View</button>
      </div>
    </div>
  );
};

export default FlatmateCard;