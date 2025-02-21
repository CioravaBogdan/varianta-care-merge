import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { matchPosition } from '../services/mapMatchingService'; // Add this import

// Definim iconițele corecte
const defaultIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const startIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'start-marker'
});

const endIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'end-marker'
});

const waypointIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'waypoint-marker'
});

function MapController({ routeCoordinates, markers }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (!map) return;

    if (routeCoordinates?.length > 0) {
      const latLngs = routeCoordinates.map(coord => L.latLng(coord[0], coord[1]));
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (markers?.length > 0) {
      const latLngs = markers.map(marker => L.latLng(marker.position[0], marker.position[1]));
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeCoordinates, markers, map]);

  return null;
}

const MapComponent = ({ center = [45.9432, 24.9668], zoom = 7, markers = [], routeCoordinates = [], onMapClick }) => {
  const getMarkerIcon = (index, total) => {
    if (index === 0) return startIcon;
    if (index === total - 1) return endIcon;
    return waypointIcon;
  };

  const handleMapClick = async (e) => {
    if (onMapClick) {
      const { lat, lng } = e.latlng;
      
      try {
        const matchedPosition = await matchPosition(lat, lng);
        
        if (matchedPosition?.matchedPosition) {
          onMapClick([
            matchedPosition.matchedPosition.latitude,
            matchedPosition.matchedPosition.longitude
          ]);
        } else {
          onMapClick([lat, lng]);
        }
      } catch (error) {
        console.error('Map matching error:', error);
        onMapClick([lat, lng]);
      }
    }
  };

  return (
    <div className="map-container">
      <MapContainer 
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '600px', width: '100%' }}
        eventHandlers={{ click: handleMapClick }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {markers?.map((marker, index) => (
          <Marker 
            key={index} 
            // Asigură-te că position este [lat, lng]
            position={marker.position}
            icon={getMarkerIcon(index, markers.length)}
          >
            <Popup>{marker.popupText || "Location"}</Popup>
          </Marker>
        ))}

        {routeCoordinates?.length > 0 && (
          <Polyline 
            positions={routeCoordinates}
            pathOptions={{
              color: '#2882C8',
              weight: 5,
              opacity: 0.65
            }}
          />
        )}

        <MapController routeCoordinates={routeCoordinates} markers={markers} />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
