export const validateCoordinates = (coords) => {
  return Array.isArray(coords) && 
         coords.length === 2 && 
         typeof coords[0] === 'number' && 
         typeof coords[1] === 'number';
};

export const validateWaypoints = (waypoints) => {
  return waypoints.every(wp => validateCoordinates(wp));
};