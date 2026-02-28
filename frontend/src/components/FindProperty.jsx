/**
 * This component allows users to search for properties based on various filters such as locality, price range, area, and BHK type.
 * It fetches and displays matching properties from the backend and provides options to clear or apply filters.
 */

import React, { useState, useEffect } from "react";
import SearchArea from "./FindPropertyComponents/SeachArea";
import "../css/FindPropertyStyles/FindProperty.css";
import PropertyCardTenant from "../components/FindPropertyComponents/PropertyCardTenant";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import config from "../config.json";

function FindProperty() {
  // State variables for filters and properties
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [BHK, setBHK] = useState([]);
  const [values, setValues] = useState([0, 100000]); // Price range [min, max]
  const [area, setArea] = useState([0, 10000]); // Area range [min, max]
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");
  const [somethingwentwrong, setSomethingwentwrong] = useState(false);
  const [lastSearchLocality, setLastSearchLocality] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);

  const navigate = useNavigate();

  // Filter properties based on the last searched locality
  const matchingProperties = properties.filter(
    (property) => property.town === lastSearchLocality
  );
  const otherProperties = properties.filter(
    (property) => property.town !== lastSearchLocality
  );

  // Toast notification helper
  const notify = (message) => toast(message);

  // Handle price slider change
  const handleSliderChange = (newValues) => {
    setValues(newValues); // `newValues` is an array like [minValue, maxValue]
  };

  // Handle area slider change
  const handleAreaChange = (newArea) => {
    setArea(newArea); // `newArea` is an array like [minValue, maxValue]
  };

  // Handle BHK selection toggle
  const handleBHKChange = (bhk) => {
    if (BHK.includes(bhk)) {
      // Remove BHK if already selected
      setBHK(BHK.filter((b) => b !== bhk));
    } else {
      // Add BHK to selection
      setBHK([...BHK, bhk]);
    }
  };

  // Apply filters and fetch properties
  const handleApplyChanges = async () => {
    try {
      if (!locality) {
        notify("Please select a locality!");
        return;
      }

      const response = await axios.get(
        `${config.backend}/api/Search_Routes/SearchProperties`,
        {
          params: {
            town: locality,
            min_price: values[0],
            max_price: values[1],
            min_area: area[0],
            max_area: area[1],
            bhk: BHK.length > 0 ? BHK.join(",") : undefined,
          },
        }
      );

      setLastSearchLocality(locality);
      setProperties(response.data);
      setError("");
      setFiltersApplied(true);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(err.response?.data?.error || "Something went wrong");
      setFiltersApplied(false);
      setSomethingwentwrong(true);
    }
  };

  // Handle errors and navigate back if something went wrong
  useEffect(() => {
    if (localStorage.getItem("authtoken") === null) {
      navigate("/login"); // Redirect to login if not authenticated
    }
    if (somethingwentwrong) {
      toast.error("Something went wrong. Please try again later.");
      navigate(-1);
    }
  }, [somethingwentwrong]);

  // Clear all filters and reset state
  const handleClearChanges = () => {
    setCity("");
    setLocality("");
    setBHK([]);
    setValues([0, 100000]);
    setArea([0, 10000]);
    setProperties([]);
    setError("");
    setLastSearchLocality("");
    setFiltersApplied(false);
  };

  return (
    <div className="find-property-body">
      {/* Search area for filters */}
      <div className="search-area-div">
        <SearchArea
          city={city}
          setCity={setCity}
          locality={locality}
          setLocality={setLocality}
          BHK={BHK}
          setBHK={setBHK}
          values={values}
          setValues={setValues}
          area={area}
          setArea={setArea}
          handleSliderChange={handleSliderChange}
          handleAreaChange={handleAreaChange}
          handleBHKChange={handleBHKChange}
          handleApplyChanges={handleApplyChanges}
          handleClearChanges={handleClearChanges}
        />
      </div>

      {/* Property cards section */}
      <div className="Property-card-div">
        {/* Prompt to apply filters */}
        {!filtersApplied && (
          <div className="empty-state-container">
            <img
              src="./house_when_page_empty.png"
              alt="No Filters Applied"
              className="empty-state-img"
            />
            <h2 className="empty-message">
              Please select a locality in filters and click apply
            </h2>
          </div>
        )}

        {/* No matches found */}
        {filtersApplied && matchingProperties.length === 0 && (
          <div className="empty-state-container">
            <img
              src="./house_when_page_empty.png"
              alt="No match"
              className="empty-state-img"
            />
            <h2 className="empty-message">
              Sorry! No property matched with your filters
            </h2>
          </div>
        )}

        {/* Matching properties */}
        {matchingProperties.length > 0 && (
          <>
            <h2>Properties in {lastSearchLocality}</h2>
            {matchingProperties.map((property) => (
              <PropertyCardTenant
                key={property._id}
                image={property.Images[0]}
                price={property.price}
                title={property.name}
                location={`${property.address}`}
                bhk={property.bhk}
                onView={() => console.log("Viewing:", property.name)}
                onDelete={() => console.log("Deleting:", property._id)}
                id={property._id}
                available={property.available}
              />
            ))}
          </>
        )}

        {/* Other recommendations */}
        {otherProperties.length > 0 && (
          <>
            <h2>Other Properties You May Be Interested In</h2>
            {otherProperties.map((property) => (
              <PropertyCardTenant
                key={property._id}
                image={property.Images[0]}
                price={property.price}
                title={property.name}
                location={`${property.address}`}
                bhk={property.bhk}
                onView={() => console.log("Viewing:", property.name)}
                onDelete={() => console.log("Deleting:", property._id)}
                id={property._id}
                available={property.available}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default FindProperty;
