import React from "react";
import "../../css/FindPropertyStyles/SearchArea.css";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SearchArea({
  city,
  setCity,
  locality,
  setLocality,
  BHK,
  setBHK,
  values,
  setValues,
  area,
  setArea,
  handleSliderChange,
  handleAreaChange,
  handleApplyChanges,
  handleClearChanges,
  properties = [],
}) {
  const bhkOptions = [
    { label: "1 BHK", value: 1 },
    { label: "2 BHK", value: 2 },
    { label: "3 BHK", value: 3 },
    { label: "More", value: "more" },
  ];

  const handleBHKChange = (value) => {
    if (BHK.includes(value)) {
      setBHK(BHK.filter((bhk) => bhk !== value));
    } else {
      setBHK([...BHK, value]);
    }
  };

  const onApplyClick = () => {
    if (!city) {
      toast.error("Please select a city");
      return;
    }
    if (!locality) {
      toast.error("Please select a locality");
      return;
    }
    // all good — fire the parent handler
    handleApplyChanges();
  };

  const filteredProperties = properties.filter((property) => {
    if (BHK.length === 0) return true;
    return BHK.some((filterValue) =>
      filterValue === "more"
        ? property.bhk >= 5
        : property.bhk === filterValue
    );
  });

  return (
    <div className="search-prop-container">
      <h1>Filters</h1>

      {/* City Filter */}
      <div className="city-search-container">
        <label>City</label>
        <select
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setLocality(""); // always reset locality when city changes
          }}
        >
          <option value="">Select City</option>
          <option value="Mumbai">Mumbai</option>
        </select>
      </div>

      {/* Locality Filter */}
      <div className="locality-search-container">
        <label>Locality</label>
        <select
          value={locality}
          disabled={!city}
          onChange={(e) => setLocality(e.target.value)}
        >
          <option value="">Select Locality</option>
          <option value="Andheri">Andheri</option>
          <option value="Bandra">Bandra</option>
          <option value="Juhu">Juhu</option>
          <option value="Malad">Malad</option>
          <option value="Kandivali">Kandivali</option>
          <option value="Borivali">Borivali</option>
          <option value="Dahisar">Dahisar</option>
          <option value="Mira Road">Mira Road</option>
          <option value="Thane">Thane</option>
          <option value="Goregaon">Goregaon</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="price-range-container">
        <label>Price Range</label>
        <div className="price-range-values">
          <p>₹{values[0]} - ₹{values[1]}</p>
        </div>
        <RangeSlider
          min={0}
          max={100000}
          step={250}
          value={values}
          onInput={handleSliderChange}
        />
      </div>

      {/* Area Range */}
      <div className="area-range-container">
        <label>Area Range</label>
        <div className="area-range-values">
          <p>{area[0]} sqft - {area[1]} sqft</p>
        </div>
        <RangeSlider
          min={0}
          max={10000}
          step={50}
          value={area}
          onInput={handleAreaChange}
        />
      </div>

      {/* BHK Filter */}
      <div className="BHK-container">
        <label>Number of BHK</label>
        {bhkOptions.map(({ label, value }) => (
          <div key={value} className="BHK-checkbox">
            <input
              type="checkbox"
              checked={BHK.includes(value)}
              onChange={() => handleBHKChange(value)}
            />
            <label>{label}</label>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="search-prop-buttons">
        <button onClick={onApplyClick}>Apply</button>
        <button onClick={handleClearChanges}>Clear filters</button>
      </div>

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Optional: Show filtered properties */}
      {/* ... */}
    </div>
  );
}

export default SearchArea;
