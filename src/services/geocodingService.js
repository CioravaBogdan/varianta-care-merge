import axios from 'axios';

const BASE_URL = 'https://api.myptv.com/geocoding/v1';
const apiKey = process.env.REACT_APP_MYPTV_API_KEY;

export const searchLocationsByText = async (searchText, language = 'en') => {
  try {
    if (!searchText || searchText.length < 2) {
      return [];
    }

    const response = await axios.get(`${BASE_URL}/locations/by-text`, {
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': apiKey
      },
      params: {
        searchText: searchText.trim(),
        language
      }
    });

    if (!response.data || !response.data.locations) {
      console.warn('No locations found in response:', response.data);
      return [];
    }

    return response.data.locations.map(location => ({
      formattedAddress: `${location.address.city || ''}, ${location.address.country || ''}`.trim(),
      coordinates: [
        location.referencePosition.latitude,
        location.referencePosition.longitude
      ]
    }));
  } catch (error) {
    console.error('Geocoding error:', error.response?.data || error);
    return [];
  }
};

export const getSuggestions = async (searchText, language = 'en') => {
  try {
    if (!searchText || searchText.length < 2) {
      return [];
    }

    const response = await axios.get(`${BASE_URL}/suggestions/by-text`, {
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': apiKey // Note the capital 'K' in ApiKey
      },
      params: {
        searchText: searchText.trim(),
        language,
        maxResults: 5
      }
    });

    return response.data.suggestions.map(suggestion => ({
      text: suggestion.caption,
      formattedAddress: suggestion.caption,
      coordinates: suggestion.referencePosition ? 
        [suggestion.referencePosition.latitude, suggestion.referencePosition.longitude] : null
    }));
  } catch (error) {
    console.error('Suggestions error:', error.response?.data || error);
    return [];
  }
};

export const reverseGeocode = async (latitude, longitude, language = 'en') => {
  try {
    const response = await axios.get(`${BASE_URL}/locations/by-position/${latitude}/${longitude}`, {
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': apiKey // Note the capital 'K' in ApiKey
      },
      params: {
        language
      }
    });

    if (response.data?.locations?.[0]) {
      const location = response.data.locations[0];
      return {
        formattedAddress: location.formattedAddress || location.address?.freeformAddress,
        coordinates: [
          location.referencePosition.latitude,
          location.referencePosition.longitude
        ]
      };
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error.response?.data || error);
    return null;
  }
};