
/**
 * This is the main landing page for the Roomble application. It introduces the platform,
 * highlights its key features, and provides call-to-action buttons for unauthenticated users
 * to sign up as either tenants or landlords.
 */

import React from "react";
import { Link } from "react-router-dom";
import FadeInAnimation from "../components/animations/FadeInAnimation.jsx";
import "../css/Home.css"; // Import CSS for styling

export const Home = () => {
  return (
    <>
      {/* First Section: Introduction */}
      <section className="home-first">
        <div className="home-first-intro">
          <h1>Welcome to Roomble!</h1>
          <p>
            Discover your perfect space with Roomble! Whether you're a tenant
            searching for a cozy home, a landlord managing properties, or
            someone looking for the ideal flatmate, Roomble makes it seamless
            and stress-free. Start your journey today!
          </p>
        </div>
      </section>

      {/* Second Section: Features */}
      <section className="home-second">
        <div className="home-second-features">
          <FadeInAnimation>
            <h2>Features</h2>
          </FadeInAnimation>
          <div className="home-second-features-list">
            {/* Feature: Find your dream home */}
            <FadeInAnimation>
              <div className="home-second-features-item">
                <i className="fas fa-home"></i>
                <p>Find your dream home</p>
              </div>
            </FadeInAnimation>

            {/* Feature: Connect with potential flatmates */}
            <FadeInAnimation>
              <div className="home-second-features-item">
                <i className="fas fa-user-friends"></i>
                <p>Connect with potential flatmates</p>
              </div>
            </FadeInAnimation>

            {/* Feature: Manage your properties */}
            <FadeInAnimation>
              <div className="home-second-features-item">
                <i className="fas fa-building"></i>
                <p>Manage your properties</p>
              </div>
            </FadeInAnimation>

            {/* Feature: Read and Write Reviews */}
            <FadeInAnimation>
              <div className="home-second-features-item">
                <i className="fas fa-star"></i>
                <p>Read and Write Reviews</p>
              </div>
            </FadeInAnimation>

            {/* Feature: Send and Receive Messages */}
            <FadeInAnimation>
              <div className="home-second-features-item">
                <i className="fas fa-envelope"></i>
                <p>Send and Receive Messages</p>
              </div>
            </FadeInAnimation>
          </div>
        </div>
      </section>

      {/* Third Section: Call to Action (only if user is not authenticated) */}
      {localStorage.getItem("authtoken") === null && (
        <section className="home-third">
          <div className="home-third-cta">
            <FadeInAnimation>
              <h2>Ready to get started?</h2>
            </FadeInAnimation>
            <div className="home-third-buttons">
              {/* Button: Sign Up as Tenant */}
              <FadeInAnimation>
                <Link to="/signup-tenant" className="home-third-button">
                  Sign Up as Tenant
                </Link>
              </FadeInAnimation>

              {/* Button: Sign Up as Landlord */}
              <FadeInAnimation>
                <Link to="/signup-landlord" className="home-third-button">
                  Sign Up as Landlord
                </Link>
              </FadeInAnimation>
            </div>
          </div>
        </section>
      )}
    </>
  );
};
