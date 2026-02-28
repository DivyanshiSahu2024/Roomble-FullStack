import React from "react";
import "../css/404NotFound.css";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../../public/404robot.json";

const Error404 = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-left">
        <div className="not-found-code">404</div>
        <div className="not-found-message">Oops! Page Not Found</div>
        <p className="not-found-description">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button className="not-found-home-button" onClick={() => navigate("/")}>
        Back to Home
        </button>
      </div>
      <div className="not-found-right">
        <Lottie animationData={animationData} className="not-found-lottie" loop autoplay />
      </div>
    </div>
  );
};

export default Error404;
