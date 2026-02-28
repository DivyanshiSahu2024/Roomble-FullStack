/**
 * This component displays the profile and properties of a landlord based on the ID provided in the URL parameters.
 * It fetches the landlord's details, properties, and reviews from the backend and displays them in a structured layout.
 * Users can message the landlord, leave a review, or navigate to the landlord's properties and reviews.
 */

import React, { useEffect, useState } from "react";
import "../css/LandlordProfileStyles/LandlordProfile.css";
import PropertyCard from "./LandlordDashboard/PropertyCard.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { Rating } from "@mui/material";
import { toast } from "react-toastify";
import config from "../config.json";

const OtherLandlord = () => {
  const [respData, setRespData] = useState({
    name: "Loading...",
    email: "Loading...",
    message: "Loading...",
    Properties: [],
    Images: `Loading...`,
  }); // State to store landlord details
  const navigate = useNavigate();
  const params = useParams(); // Extract landlord ID from URL parameters
  const [reviews, setReviews] = useState([
    {
      reviewername: "",
      reviewerimage: "",
      rating: 0,
      comment: "",
    },
  ]); // State to store reviews of the landlord

  const [somethingwentwrong, setSomethingwentwrong] = useState(false); // State to handle errors

  // Fetch landlord details and reviews
  useEffect(() => {
    if (localStorage.getItem("authtoken") === null) {
      navigate("/login"); // Redirect to login if not authenticated
    }
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${config.backend}/api/view_profiles/other_users`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requested_id: params.id,
              accounttype: "landlord",
            }),
          }
        );
        const data = await response.json();
        if (data.success) {
          setRespData(data); // Set landlord details
        } else {
          setSomethingwentwrong(true);
        }
      } catch (error) {
        setSomethingwentwrong(true);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`${config.backend}/api/reviews/reviewee`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reviewee: params.id }),
        });
        const data = await response.json();
        if (data.success) {
          setReviews(data.reviews); // Set landlord reviews
        } else {
          setSomethingwentwrong(true);
        }
      } catch (error) {
        setSomethingwentwrong(true);
      }
    };

    fetchData();
    fetchReviews();
  }, []);

  // Handle messaging the landlord
  const messageclick = async () => {
    try {
      const response = await fetch(
        `${config.backend}/messages/createConversation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authtoken: localStorage.getItem("authtoken"),
          },
          body: JSON.stringify({ user2: params.id }),
        }
      );
      const data = await response.json();
      if (data.success) {
        navigate("/chat/" + data.conversation_id); // Navigate to the chat page
      } else {
        setSomethingwentwrong(true);
      }
    } catch (error) {
      setSomethingwentwrong(true);
    }
  };

  // Navigate to the review page
  const reviewclick = () => {
    navigate("/review/" + params.id);
  };

  // Redirect to tenant or landlord profile
  const redirectto = (type, id) => {
    if (type === "tenant") {
      return () => navigate("/tenant/" + id);
    } else {
      return () => navigate("/landlord/" + id);
    }
  };

  // Handle errors and navigate back
  useEffect(() => {
    if (somethingwentwrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1);
    }
  }, [somethingwentwrong]);

  return (
    <>
      <div className="landlord-profile-container">
        {/* Combined Profile & Properties Section */}
        <div className="landlord-profile-content">
          <div className="landlord-profile-header">
            <img
              src={
                respData
                  ? respData.Images
                  : `${config.backend}/Pictures/Default.png`
              }
              alt="Profile"
              className="landlord-profile-image"
            />
            <div className="landlord-profile-details">
              <div className="landlord-profile-item">
                <div className="landlord-profile-name">
                  <p>
                    <span className="label">Full Name</span>{" "}
                    <span className="separator">:</span>
                    <span className="value">
                      {respData ? respData.name : "Loading..."}
                    </span>
                  </p>
                </div>
                <div className="landlord-profile-email">
                  <p>
                    <span className="label">Email Address</span>{" "}
                    <span className="separator">:</span>
                    <span className="value">
                      {respData ? respData.email : "Loading..."}
                    </span>
                  </p>
                </div>
                <div className="landlord-profile-propCount">
                  <p>
                    <span className="label">Properties Count</span>{" "}
                    <span className="separator">:</span>
                    <span className="value">
                      {respData ? respData.message : "Loading..."}
                    </span>
                  </p>
                </div>

                <div className="landlord-profile-buttons">
                  <button
                    className="landlord-profile-edit-button"
                    onClick={messageclick}
                  >
                    Message
                  </button>
                  <button
                    className="landlord-profile-edit-button"
                    onClick={reviewclick}
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Section */}
          <div className="landlord-profile-properties">
            {respData
              ? respData.Properties.map(
                  ({ _id, town, bhk, price, Images, available }) => (
                    <PropertyCard
                      key={_id}
                      image={Images[0]}
                      price={price}
                      title="Prop Card"
                      location={town}
                      bhk={bhk}
                      id={_id}
                      available={available}
                    />
                  )
                )
              : "Loading..."}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="reviews">
        <h2>Reviews</h2>
        <div className="reviews-container">
          {reviews.map((review, index) => (
            <div className="reviews1" key={index}>
              <div
                className="reviews-user-details"
                onClick={redirectto(review.reviewertype, review.reviewer)}
              >
                <div className="reviews-user-image">
                  <img src={review.reviewerimage} alt="" />
                </div>
                <div className="reviews-user-name">
                  <b>{review.reviewername}</b>
                  <div className="reviews-rating">
                    <Rating
                      name="half-rating"
                      value={review.rating}
                      precision={1}
                      size="small"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="reviews-comment">{review.comment}</div>
            </div>
          ))}
          {reviews.length === 0 && <p>No reviews posted.</p>}
        </div>
      </section>
    </>
  );
};

export default OtherLandlord;
