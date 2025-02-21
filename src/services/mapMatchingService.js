import axios from 'axios';

const MAP_MATCH_API = 'https://api.myptv.com/mapmatch/v1';

export const matchPosition = async (latitude, longitude) => {
  try {
    const response = await axios.get(`${MAP_MATCH_API}/positions/${latitude}/${longitude}`, {
      headers: {
        'apiKey': process.env.REACT_APP_MYPTV_API_KEY
      },
      params: {
        calculationMode: 'QUALITY',
        results: ['SEGMENT_ATTRIBUTES', 'GEOMETRY'],
        radius: 50,
        bearingInDegrees: 0
      }
    });

    if (response.data && response.data.matchedPosition) {
      return {
        matchedPosition: {
          latitude: response.data.matchedPosition.latitude,
          longitude: response.data.matchedPosition.longitude
        },
        roadAttributes: response.data.segmentAttributes
      };
    }
    return null;
  } catch (error) {
    console.error('Map matching error:', error);
    return null;
  }
};

export const matchTrack = async (positions) => {
  try {
    const response = await axios.post(`${MAP_MATCH_API}/tracks`, {
      positions: positions.map(pos => ({
        latitude: pos[0],
        longitude: pos[1]
      })),
      calculationMode: 'QUALITY',
      results: ['MATCHED_POSITIONS', 'SEGMENT_ATTRIBUTES']
    }, {
      headers: {
        'apiKey': process.env.REACT_APP_MYPTV_API_KEY
      }
    });

    return response.data;
  } catch (error) {
    console.error('Track matching error:', error);
    return null;
  }
};