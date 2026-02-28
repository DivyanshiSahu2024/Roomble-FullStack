
/**
 * FindFlatmate Component
 * Displays a list of flatmates based on filters applied.
 */

import React, { useContext, useState } from "react";
import SearchFlatmatesFilter from "./SearchFlatmatesFilter";
import FlatmateCard from "../FlatmateCard";
import { Basecontext } from "../../context/base/Basecontext";
import "../../css/FindFlatmate.css";


function FindFlatmate() {
    // State to store the list of flatmates
    const [flatmates, setFlatmates] = useState([]);

    // Access user role from Basecontext
    const { user } = useContext(Basecontext);

    return (
        <div className="find-flatmate-body">
            {/* Filter Section */}
            <div className="search-flatmate-div">
                {/* Pass setFlatmates to update the flatmates state */}
                <SearchFlatmatesFilter setFlatmates={setFlatmates} />
            </div>

            {/* Flatmate Cards Section */}
            <div className="Flatmate-card-div">
                <div className="flatmate-cards-container">
                    {/* Render flatmate cards if data is available */}
                    {flatmates.length > 0 ? (
                        flatmates.map((flatmate) => (
                            <FlatmateCard
                                key={flatmate._id} // Unique key for each card
                                id={flatmate._id}
                                name={flatmate.name}
                                locality={flatmate.locality}
                                city={flatmate.city}
                                gender={flatmate.gender}
                                smoke={flatmate.smoke}
                                eatNonVeg={flatmate.veg}
                                pets={flatmate.pets}
                                compatibilityScore={flatmate.recommendationScore}
                                image={flatmate.Images}
                                isBookmarked={flatmate.bookmarked}
                                help={false}
                            />
                        ))
                    ) : (
                        // Display message if no flatmates are found
                        <p>No flatmates found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FindFlatmate;
