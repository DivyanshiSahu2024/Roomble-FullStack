
/**
 * This component renders the navigation bar for the application. It dynamically adjusts
 * the menu options based on the user's type (none, tenant, or landlord) and displays
 * appropriate links. It also handles user data fetching and socket connection setup
 * for real-time updates.
 */

import React, { useEffect, useContext } from "react";
import "../css/Navbar.css";
import { Basecontext } from "../context/base/Basecontext";
import { Link } from "react-router-dom";
import { socket } from "../socket";
import "react-toastify/dist/ReactToastify.css";

export const Navbar = () => {
  // Access user details and context functions from Basecontext
  const state = useContext(Basecontext);
  const { user, setUser, fetuser, loading } = state; // `loading` indicates if data is being fetched

  useEffect(() => {
    // Fetch the user data when the component mounts
    fetuser();
  }, []);

  useEffect(() => {
    // Handle socket connection when the user is updated
    function handleConnection() {
      if (user && user._id) {
        socket.emit("user_connected", user._id); // Notify the server about the connected user
      }
    }
    if (user && user._id) {
      handleConnection();
    }
    return () => {
      socket.off("connect", handleConnection); // Clean up the socket connection
    };
  }, [user]);

  return (
    <div className="navbar">
      {/* Display a loading indicator if data is being fetched */}
      <div className={loading ? "loading-flex" : "loading-none"}>
        <p>Loading...</p>
      </div>

      {/* Logo Section */}
      <div className="logo">
        <img src="/logo_nav.png" alt="logo" className="logo-img" />
      </div>

      {/* Menu Section */}
      <div className="menu">
        {user.type === "none" ? (
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/signup-tenant">Sign-Up as Tenant</Link></li>
            <li><Link to="/signup-landlord">Sign-Up as Landlord</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        ) : user.type === "tenant" ? (
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/tenant-dashboard">Dashboard</Link></li>
            <li><Link to="/messages">Messages</Link></li>
            <li><Link to="/find-property">Find Property</Link></li>
            <li><Link to="/find-flatmate">Find Flatmate</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        ) : (
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/landlord-dashboard">Dashboard</Link></li>
            <li><Link to="/add-property">Add Property</Link></li>
            <li><Link to="/messages">Messages</Link></li>
            <li><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        )}
      </div>

      {/* Account Section */}
      <div className="account-logo">
        {user.type === "none" ? (
          <>
            {/* Optionally add login/signup buttons here */}
          </>
        ) : (
          <Link to={user.type === "tenant" ? "/tenant-profile-page" : "/landlord-profile-page"}>
            <img src={state.user.Images} alt="account" className="account-img" />
          </Link>
        )}
      </div>
    </div>
  );
};
