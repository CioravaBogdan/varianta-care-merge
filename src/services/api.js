// client/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const getAutocomplete = async (text, lang = 'en') => {
  try {
    console.log('Sending request for:', text); // Debug log
    const response = await axios.get(`${API_URL}/api/geocode`, {
      params: {
        text,
        lang
      }
    });

    console.log('API Response:', response.data); // Debug log

    if (response.data && response.data.locations) {
      const locations = response.data.locations.map(location => ({
        formattedAddress: location.formattedAddress,
        coordinates: location.coordinates
      }));
      console.log('Processed locations:', locations); // Debug log
      return locations;
    }

    return [];
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};

export const analyzeData = async (data) => {
  try {
    console.log('Sending analysis request with language:', data.userLanguage);
    const response = await axios.post(`${API_URL}/api/assistant-route`, {
      ...data,
      userLanguage: data.userLanguage,
      requireStrictLanguage: true
    });
    return response.data;
  } catch (error) {
    console.error('Error in analyzeData:', error);
    return {};
  }
};

export const getRoute = async (waypoints, truckMode) => {
  const apiKey = process.env.REACT_APP_MYPTV_API_KEY;
  
  try {
    // Format waypoints for PTV API
    const waypointsFormatted = waypoints.map(wp => `${wp[0]},${wp[1]}`);

    const response = await axios.get('https://api.myptv.com/routing/v1/routes', {
      headers: {
        'ApiKey': apiKey
      },
      params: {
        waypoints: waypointsFormatted,
        profile: mapTruckModeToProfile(truckMode),
        results: 'POLYLINE',
        options: {
          currency: 'EUR',
          trafficMode: 'REALISTIC'
        }
      },
      paramsSerializer: params => {
        const searchParams = new URLSearchParams();
        params.waypoints.forEach(wp => searchParams.append('waypoints', wp));
        searchParams.append('profile', params.profile);
        searchParams.append('results', params.results);
        Object.entries(params.options).forEach(([key, value]) => {
          searchParams.append(`options[${key}]`, value);
        });
        return searchParams.toString();
      }
    });

    // Parse polyline and swap coordinates
    const coordinates = JSON.parse(response.data.polyline).coordinates.map(coord => [coord[1], coord[0]]);

    return {
      features: [{
        properties: {
          distance: response.data.distance,
          time: response.data.travelTime
        },
        transformedCoordinates: coordinates
      }]
    };
  } catch (error) {
    console.error('Routing error:', error.response?.data || error);
    throw error;
  }
};

// Helper function to map truck modes to PTV profiles
const mapTruckModeToProfile = (truckMode) => {
  const profileMap = {
    'medium_truck': 'EUR_TRUCK_7_5T',
    'truck': 'EUR_TRUCK_40T',
    'heavy_truck': 'EUR_TRUCK_40T',
    'truck_dangerous_goods': 'EUR_TRUCK_HAZMAT'
  };
  return profileMap[truckMode] || 'EUR_TRUCK_40T';
};
