import React, { useState } from 'react';
import { searchLocationsByText } from '../services/geocodingService';
import { useUser } from '../contexts/UserContext';
import './WaypointInput.css';

const WaypointInput = ({ index, waypoint, onUpdate }) => {
  const [suggestions, setSuggestions] = useState([]);
  const { userLanguage } = useUser();

  const handleChange = async (e) => {
    const value = e.target.value;
    
    try {
      if (value.length > 2) {
        const locations = await searchLocationsByText(value, userLanguage);
        setSuggestions(locations || []);
      } else {
        setSuggestions([]);
      }
      
      onUpdate(index, {
        ...waypoint,
        label: value,
        coords: null
      });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleSelect = (location) => {
    if (location && location.coordinates) {
      onUpdate(index, {
        label: location.formattedAddress,
        coords: location.coordinates
      });
      setSuggestions([]);
    }
  };

  return (
    <div className="waypoint-container">
      <input
        type="text"
        value={waypoint.label || ''}
        onChange={handleChange}
        placeholder="Enter location"
        className="waypoint-input"
      />
      {suggestions.length > 0 && (
        <div className="suggestions-container">
          {suggestions.map((location, idx) => (
            <div
              key={idx}
              className="suggestion-item"
              onClick={() => handleSelect(location)}
            >
              {location.formattedAddress}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WaypointInput;
