
/**
 * This component renders a "Contact Us" page that displays contact details of developers.
 * Card includes their name, role, contact email, and profile image.
 * 
 * This data is dynamically generated from the `teamMembers` array.
 */

import React from "react";
import "../css/ContactUs.css";

// Array containing details
const teamMembers = [
  {
    name: "Divyanshi Sahu",
    role: "Software Developer",
    contact: "divyanshisahuds@gmail.com",
    image: "./DivyanshiSahu.jpg",
  },
];

// Component to display the team page
const TeamPage = () => {
  return (
    <div className="team-container">
      {/* Page heading */}
      <h1 className="team-heading">Contact here</h1>

      {/* Grid layout for team members */}
      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <div className="team-card" key={index}>
            {/* Team member image */}
            <div className="team-image-wrapper">
              <img src={member.image} alt={member.name} className="team-image" />
            </div>

            {/* Team member name */}
            <h3 className="team-name">{member.name}</h3>

            {/* Team member role */}
            <p className="team-role">{member.role}</p>

            {/* Team member contact email */}
            <a className="team-contact" href={`mailto:${member.contact}`}>
              <i className="fas fa-envelope"></i> {member.contact}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamPage;
