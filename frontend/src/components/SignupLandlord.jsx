
/**
 * This component renders the landlord signup page, displaying the Roomble logo 
 * and embedding the SignupformLandlord component for landlord registration.
*/

import React from "react";
import logo from "../../public/logo.png";
import SignupformLandlord from "./SignupformLandlord.jsx"; // Component for the landlord signup form
import "../css/SignupLandlord.css"; // CSS for styling the signup page

function SignupLandlord({ setID }) {
  return (
    <div className="Container">
      {/* Container for the Roomble logo */}
      <div className="signup-tenant-contaier">
        <img src={logo} alt="Roomble Logo" />
      </div>
      {/* Embedding the SignupformLandlord component */}
      <div>
        <SignupformLandlord setID={setID} />
      </div>
    </div>
  );
}

export default SignupLandlord;
