
/**
 * This component renders the tenant signup page, displaying the Roomble logo 
 * and embedding the SignUpForm component for user registration.
*/

import React from "react";
import logo from "../../public/logo.png";
import SignUpForm from "./SignUpForm.jsx";
import "../css/SignUpTenant.css";

function SignUpPage({ setID }) {
  return (
    <div className="signup-tenant-container">
      <img className="signup-tenant-logo" src={logo} alt="Roomble Logo" />
      <div>
        <SignUpForm setID={setID} />
      </div>
    </div>
  );
}

export default SignUpPage;
