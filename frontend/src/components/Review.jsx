/**
 * This page allows users to submit a review for another user (tenant or landlord).
 * It includes a rating system and a text area for entering comments.
 */

import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/Review.css";
import { Rating } from "@mui/material";
import { Basecontext } from "../context/base/Basecontext";
import { toast } from "react-toastify";
import config from "../config.json";

export const Review = () => {
  const { id } = useParams(); // Extract the user ID from the URL parameters
  const [cuser, setcUser] = useState({
    name: "User Name",
    image: "/sampleUser_Img.png",
  }); // State to store the user being reviewed
  const [review, setReview] = useState(""); // State to store the review text
  const [rating, setRating] = useState(0); // State to store the rating value
  const [revieweetype, setRevieweeType] = useState("tenant"); // State to store the type of user being reviewed (tenant/landlord)
  const { user } = useContext(Basecontext); // Access the current user from the context
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("authtoken") === null) {
      navigate("/login"); // Redirect to the home page if the user is not authenticated
    }

    // Fetch user details from the backend
    const fetchUser = async () => {
      const response = await fetch(`${config.backend}/api/view_profiles/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }), // Send the user ID in the request body
      });
      const data = await response.json();
      console.log(data);
      if (data.success) {
        setcUser({
          name: data.name,
          image: data.profilepic,
        });
        setRevieweeType(data.type); // Set the type of the user being reviewed
      }
    };
    fetchUser();
  }, []);

  const handleClick = async () => {
    // Send the review to the backend
    const response = await fetch(`${config.backend}/api/reviews/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authtoken: localStorage.getItem("authtoken"), // Include the authentication token
      },
      body: JSON.stringify({
        reviewee: id, // ID of the user being reviewed
        rating: rating, // Rating value
        comment: review, // Review text
      }),
    });
    const data = await response.json();
    if (data.success) {
      toast.success("Review submitted successfully"); // Show success notification
      navigate(-1); // Navigate back to the previous page
    } else {
      toast.error(data.message); // Show error notification
    }
  };

  return (
    <>
      <div className="review-container">
        You are reviewing:
        <div className="review-user-details">
          <div className="review-user-name">
            {cuser.name} {/* Display the name of the user being reviewed */}
          </div>
          <div className="review-user-image">
            <img src={cuser.image} alt="" />{" "}
            {/* Display the profile picture of the user */}
          </div>
        </div>
      </div>
      <div className="review-form">
        <label htmlFor="review" className="review-form-label">
          Review:
        </label>
        <Rating
          name="half-rating"
          value={rating}
          precision={1}
          size="large"
          onChange={(e, n) => {
            setRating(n);
          }}
        />{" "}
        {/* Rating component for selecting the rating */}
        <textarea
          name="review"
          placeholder="Tell us about your experience"
          value={review}
          onChange={(e) => {
            setReview(e.target.value);
          }}
        ></textarea>{" "}
        {/* Textarea for entering the review */}
        <button className="review-btn" onClick={handleClick}>
          Submit
        </button>{" "}
        {/* Submit button */}
      </div>
    </>
  );
};
