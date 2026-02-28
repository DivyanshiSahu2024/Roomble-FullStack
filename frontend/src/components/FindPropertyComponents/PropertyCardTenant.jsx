
/*
 * This component represents a property card for tenants, displaying property details such as
 * image, price, location, and BHK (bedroom, hall, kitchen) information. It also allows users
 * to bookmark properties and view more details. The component handles bookmark status fetching,
 * toggling, and updating with backend API calls.
 */


import React, { useEffect, useState } from "react";
import "../../css/PropertyCard.css";
import "../../css/PropertyCardTenant.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../../config.json";
import Swal from "sweetalert2";


const PropertyCardTenant = ({
  image,
  price,
  title,
  location,
  bhk,
  onView,
  onBookMark,
  id,
  available,
}) => {
  const [bookmarked, setBookmarked] = useState(false); // State to track bookmark status
  const [loading, setLoading] = useState(true); // Prevent multiple requests
  const [somethingwentwrong, setSomethingwentwrong] = useState(false); // Error state

  // Toggle bookmark with confirmation popup
  const toggleBookmark = async () => {
    if (loading) return; // Prevent toggling while loading

    const actionText = bookmarked ? "remove the bookmark" : "bookmark this property";
    const confirmPopup = await Swal.fire({
      title: "Confirm Action",
      text: `Are you sure you want to ${actionText}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, confirm it!",
      cancelButtonText: "Cancel",
    });

    if (confirmPopup.isConfirmed) {
      setBookmarked(!bookmarked);
    }
  };

  // Fetch bookmark status on component mount
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      try {
        const response = await fetch(`${config.backend}/api/BookMarking_Routes/check_bookmark`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authtoken: localStorage.getItem("authtoken"),
          },
          body: JSON.stringify({ id: id, thing: "property" }),
        });

        const data = await response.json();
        if (data.success) {
          setBookmarked(data.bookmarked);
        } else {
          setSomethingwentwrong(true);
        }
      } catch (error) {
        console.error("Failed to fetch bookmark status:", error);
        setSomethingwentwrong(true);
      } finally {
        setLoading(false); // Stop loading after request completes
      }
    };

    fetchBookmarkStatus();
  }, [id]);

  // Update bookmark status when bookmarked state changes
  useEffect(() => {
    if (!loading) {
      const action = bookmarked ? "bookmark" : "unmark";
      fetch(`${config.backend}/api/BookMarking_Routes/edit_bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authtoken: localStorage.getItem("authtoken"),
        },
        body: JSON.stringify({ id: id, thing: "property", action }),
      }).catch((error) => {
        console.error("Failed to update bookmark status:", error);
      });
    }
  }, [bookmarked, loading, id]);

  // Handle errors and notify the user
  useEffect(() => {
    if (somethingwentwrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1);
    }
  }, [somethingwentwrong]);

  return (
    <div className={`property-card ${available ? "" : "delisted"}`}>
      {/* Image Section */}
      <div className="image-container">
        <img src={image} alt={title} className={`imagprop ${available ? "" : "delisted"}`} />
      </div>

      {/* Details Section */}
      <div className="details">
        <p className="price">{price}</p>
        <p className="description">{location}</p>
        <p className="bhk">BHK: {bhk}</p>
      </div>

      {/* Buttons Section */}
      <div className="buttons">
        <button
          className="bookmark-btn"
          onClick={toggleBookmark}
          disabled={loading}
        >
          {bookmarked ? (
            <svg className="bookmark-svg" width="40" height="40" viewBox="0 0 30 30" fill="#8b1e2f">
              <path d="M6 3c-1.1 0-2 .9-2 2v16l8-5 8 5V5c0-1.1-.9-2-2-2H6z"></path>
            </svg>
          ) : (
            <svg className="bookmark-svg" width="40" height="40" viewBox="0 0 30 30" fill="none" stroke="#8b1e2f" strokeWidth="2">
              <path d="M6 3c-1.1 0-2 .9-2 2v16l8-5 8 5V5c0-1.1-.9-2-2-2H6z"></path>
            </svg>
          )}
        </button>
        <Link className={`view-button ${available ? "" : "delisted"}`} target="_blank" to={`/property/${id}`}>
          View
        </Link>
      </div>
    </div>
  );
};

export default PropertyCardTenant;
