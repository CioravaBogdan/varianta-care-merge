import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL; // e.g., "http://localhost:5000"

export const getAutocomplete = async (text, lang = 'en') => {
  try {
    const response = await axios.get(`${API_URL}/api/geocode`, {
      params: { text, lang }
    });
    return response.data.locations;
  } catch (error) {
    console.error('Error in getAutocomplete:', error);
    return [];
  }
};

export const analyzeData = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/api/analyze`, data);
    return response.data;
  } catch (error) {
    console.error('Error in analyzeData:', error);
    return null;
  }
};

// Replace the existing mapping function with a MyPTV-oriented version
const mapTruckModeToMyptvProfile = (truckMode) => {
  const profileMap = {
    'medium_truck': 'EUR_MEDIUM_TRUCK',
    'truck': 'EUR_TRUCK_40T',
    'heavy_truck': 'EUR_HEAVY_TRUCK',
    'truck_dangerous_goods': 'EUR_HAZMAT_TRUCK',
    'long_truck': 'EUR_LONG_TRUCK'
  };
  return profileMap[truckMode] || 'EUR_TRUCK_40T';
};

export const getRoute = async (waypointsString, truckMode, language = 'en') => {
  const profile = mapTruckModeToMyptvProfile(truckMode);
  const params = new URLSearchParams();
  params.append('waypoints', waypointsString);
  params.append('mode', profile);
  params.append('lang', language);

  try {
    const response = await axios.get(`${API_URL}/api/routing`, { params });
    
    if (!response.data || !response.data.coordinates) {
      throw new Error('Invalid route response');
    }

    return {
      coordinates: response.data.coordinates,
      distance: response.data.distance,
      time: response.data.time
    };
  } catch (error) {
    console.error('Error in getRoute:', error);
    return null;
  }
};
