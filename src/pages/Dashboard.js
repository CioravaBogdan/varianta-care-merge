import React, { useState, useEffect } from 'react';
import axios from 'axios';
import L from 'leaflet';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { analyzeData, getRoute, getAutocomplete } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useUser } from '../contexts/UserContext';
import MapComponent from '../components/MapComponent';
import ComparisonTable from '../components/RouteComparison/ComparisonTable';

// Configure Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Inline WaypointInput component (updated for MyPTV response)
const WaypointInput = ({ index, waypoint, onUpdate }) => {
  const [suggestions, setSuggestions] = useState([]);
  const { userLanguage, t } = useUser();

  const handleChange = async (e) => {
    const value = e.target.value;
    onUpdate({ ...waypoint, label: value });
    
    if (value.length > 2) {
      try {
        const locations = await getAutocomplete(value, userLanguage);
        setSuggestions(locations || []);
      } catch (error) {
        console.error('Error in WaypointInput getAutocomplete:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (location) => {
    onUpdate({
      ...waypoint,
      label: location.formattedAddress,
      coords: location.coordinates
    });
    setSuggestions([]);
  };

  return (
    <div style={{ margin: '8px 0', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}>
      <label>
        <strong>{t('waypoint')} {index + 1}:</strong>
        <input
          type="text"
          value={waypoint.label || ''}
          onChange={handleChange}
          placeholder={t('enterLocation')}
          style={{ marginLeft: '0.5rem' }}
        />
      </label>
      {suggestions.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '4px 0' }}>
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelect(suggestion)}
              style={{
                cursor: 'pointer',
                background: '#f0f0f0',
                padding: '4px',
                borderRadius: '4px',
                margin: '2px 0',
              }}
            >
              {suggestion.formattedAddress}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Inline SortableWaypoint component (using dnd-kit)
const SortableWaypoint = ({ id, index, waypoint, onUpdate }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    transition,
    marginBottom: '8px',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <WaypointInput index={index} waypoint={waypoint} onUpdate={(updatedWp) => onUpdate(id, updatedWp)} />
    </div>
  );
};

// Actualizăm obiectul truckDescriptions să folosească t()
const getTruckDescriptions = (t) => ({
  medium_truck: t('mediumTruckDesc'),
  truck: t('truckDesc'),
  heavy_truck: t('heavyTruckDesc'),
  truck_dangerous_goods: t('dangerousTruckDesc'),
  long_truck: t('longTruckDesc')
});

const calculateEstimatedCost = (routeInfo) => {
  // Base cost per kilometer (in EUR)
  const baseCostPerKm = {
    medium_truck: 0.8,
    truck: 1.0,
    heavy_truck: 1.2,
    truck_dangerous_goods: 1.5,
    long_truck: 1.3
  };

  // Get distance in kilometers
  const distanceKm = routeInfo.distance / 1000;
  
  // Calculate base cost
  const baseCost = distanceKm * (baseCostPerKm[routeInfo.truckMode] || 1.0);
  
  // Add toll costs if available
  const tollCosts = routeInfo.toll || 0;
  
  // Add fuel surcharge (approximately 10%)
  const fuelSurcharge = baseCost * 0.10;
  
  // Total cost
  return baseCost + tollCosts + fuelSurcharge;
};

function Dashboard() {
  const defaultCenter = [44.4361414, 26.1027202];
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const [departure, setDeparture] = useState('');
  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [departureCoords, setDepartureCoords] = useState(null);

  const [destination, setDestination] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [destinationCoords, setDestinationCoords] = useState(null);

  const [offer, setOffer] = useState('');
  const [date, setDate] = useState('');
  const [truckMode, setTruckMode] = useState('truck');

  // List of intermediate waypoints { id, label, coords }
  const [waypoints, setWaypoints] = useState([]);

  const [markers, setMarkers] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [assistantRouteInfo, setAssistantRouteInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // For additional questions (if any)
  const [additionalQuestions, setAdditionalQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [availableQuestions, setAvailableQuestions] = useState(3);
  const [isAsking, setIsAsking] = useState(false);

  const [savedRoutes, setSavedRoutes] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const { userLanguage, t } = useUser();

  // --- Autocomplete Handlers ---
  const handleDepartureChange = async (e) => {
    const value = e.target.value;
    setDeparture(value);
    
    if (value.length > 2) {
      try {
        const locations = await getAutocomplete(value, userLanguage);
        console.log('Received locations:', locations); // Debug log
        setDepartureSuggestions(locations || []);
      } catch (error) {
        console.error('Error in getAutocomplete (Departure):', error);
        setDepartureSuggestions([]);
      }
    } else {
      setDepartureSuggestions([]);
    }
  };

  const handleDestinationChange = async (e) => {
    const value = e.target.value;
    setDestination(value);
    
    if (value.length > 2) {
      try {
        const locations = await getAutocomplete(value, userLanguage);
        setDestinationSuggestions(locations || []);
      } catch (error) {
        console.error('Error in getAutocomplete (Destination):', error);
        setDestinationSuggestions([]);
      }
    } else {
      setDestinationSuggestions([]);
    }
  };

  const selectDepartureSuggestion = (suggestion) => {
    setDeparture(suggestion.formattedAddress);
    setDepartureCoords(suggestion.coordinates);
    setDepartureSuggestions([]);
    setMapCenter(suggestion.coordinates);
  };

  const selectDestinationSuggestion = (suggestion) => {
    setDestination(suggestion.formattedAddress);
    setDestinationCoords(suggestion.coordinates);
    setDestinationSuggestions([]);
    setMapCenter(suggestion.coordinates);
  };

  // --- Waypoints ---
  const addWaypoint = () => {
    const newWp = { id: Date.now().toString(), label: '', coords: mapCenter };
    setWaypoints([...waypoints, newWp]);
  };

  const updateWaypoint = (id, updatedWp) => {
    setWaypoints(waypoints.map((wp) => (wp.id === id ? updatedWp : wp)));
  };

  const handleOnDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = waypoints.findIndex((wp) => wp.id === active.id);
    const newIndex = waypoints.findIndex((wp) => wp.id === over.id);
    setWaypoints(arrayMove(waypoints, oldIndex, newIndex));
  };

  // --- Reset ---
  const handleReset = () => {
    setDeparture('');
    setDepartureSuggestions([]);
    setDepartureCoords(null);
    setDestination('');
    setDestinationSuggestions([]);
    setDestinationCoords(null);
    setOffer('');
    setDate('');
    setTruckMode('truck');
    setWaypoints([]);
    setMarkers([]);
    setRouteCoordinates(null);
    setRouteInfo(null);
    setAssistantRouteInfo(null);
    setAdditionalQuestions([]);
    setNewQuestion('');
    setAvailableQuestions(3);
    setMapCenter(defaultCenter);
  };

  // --- Analyze Route ---
  const handleAnalyzeRoute = async () => {
    setIsLoading(true);

    try {
      // Validate departure and destination
      if (!departureCoords || !destinationCoords) {
        throw new Error('Need both departure and destination points');
      }

      // Construct waypoints array
      const allWaypoints = [
        departureCoords, // Start point
        ...waypoints.filter(wp => wp.coords).map(wp => wp.coords), // Intermediate points
        destinationCoords // End point
      ];

      console.log('Calculating route with waypoints:', allWaypoints);

      // Get route from PTV API
      const routeResponse = await getRoute(allWaypoints, truckMode);
      
      if (!routeResponse?.features?.[0]) {
        throw new Error('No route found');
      }

      const route = routeResponse.features[0];
      console.log('Route calculated:', route);

      // Update UI with route information
      setRouteCoordinates(route.transformedCoordinates);
      setRouteInfo({
        distance: route.properties.distance,
        time: route.properties.time
      });

      // Prepare data for Claude analysis
      const requestData = {
        departure,
        departureCoords,
        destination,
        destinationCoords,
        offer,
        selectedDate: date,
        truckMode,
        waypoints: waypoints.map(wp => ({
          label: wp.label,
          coords: wp.coords
        })),
        routeDetails: {
          distance: route.properties.distance,
          time: route.properties.time,
          coordinates: route.transformedCoordinates
        },
        userLanguage
      };

      // Get analysis from Claude
      const response = await analyzeData(requestData);
      setAssistantRouteInfo(response.content?.[0]?.text || 'No analysis available.');

    } catch (error) {
      console.error('Route analysis error:', error);
      setAssistantRouteInfo(`Error: ${error.message}`);
      setRouteCoordinates(null);
      setRouteInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Additional Question ---

const handleAskAdditionalQuestion = async () => {
  if (!newQuestion.trim() || availableQuestions <= 0) return;
  setIsAsking(true);

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/assistant-route`,
      {
        departure,
        departureCoords,
        destination,
        destinationCoords,
        offer,
        selectedDate: date,
        truckMode,
        userLanguage, // Adăugăm limba
        additionalPrompt: newQuestion,
        routeDetails: routeInfo // Include route details for context
      }
    );

    const answer = response.data?.content?.[0]?.text || t('noAnswerAvailable');
    
    setAdditionalQuestions(prev => [...prev, {
      question: newQuestion,
      answer: answer.trim(),
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    setNewQuestion('');
    setAvailableQuestions(prev => prev - 1);
  } catch (error) {
    console.error('Error:', error);
    setAdditionalQuestions(prev => [...prev, {
      question: newQuestion,
      answer: t('errorProcessingQuestion'),
      timestamp: new Date().toLocaleTimeString()
    }]);
  } finally {
    setIsAsking(false);
  }
};

  const saveCurrentRoute = () => {
    if (routeInfo) {
      const newRoute = {
        name: `${departure} to ${destination}`,
        distance: routeInfo.distance,
        time: routeInfo.time,
        estimatedCost: calculateEstimatedCost({
          ...routeInfo,
          truckMode // Add the current truckMode
        }),
        tollCosts: routeInfo.toll,
        waypoints: waypoints,
        truckMode
      };
      setSavedRoutes([...savedRoutes, newRoute]);
    }
  };

  useEffect(() => {
    const newMarkers = [];
    
    // Marker pentru punctul de plecare
    if (departureCoords) {
      newMarkers.push({
        position: departureCoords,
        popupText: `Plecare: ${departure}`
      });
    }
    
    // Markers pentru waypoints intermediare
    waypoints.forEach((wp, index) => {
      if (wp.coords) {
        newMarkers.push({
          position: wp.coords,
          popupText: `Waypoint ${index + 1}: ${wp.label}`
        });
      }
    });
    
    // Marker pentru destinație
    if (destinationCoords) {
      newMarkers.push({
        position: destinationCoords,
        popupText: `Destinație: ${destination}`
      });
    }
    
    setMarkers(newMarkers);
  }, [departure, departureCoords, destination, destinationCoords, waypoints]);

  // În componenta Dashboard, folosim:
  const descriptions = getTruckDescriptions(t);

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h2>{t('dashboard')}</h2>
      
      {/* Departure */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <label>
          <strong>{t('departure')}:</strong>
          <input
            type="text"
            value={departure}
            onChange={handleDepartureChange}
            style={{ marginLeft: '0.5rem', width: '300px' }}
          />
        </label>
        {departureSuggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            width: '300px',
            maxHeight: '200px',
            overflowY: 'auto',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginTop: '4px',
            left: '85px'
          }}>
            {departureSuggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => selectDepartureSuggestion(suggestion)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  color: '#333',
                  background: 'white',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {suggestion.formattedAddress || 'Unknown location'}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Destination */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <label>
          <strong>{t('destination')}:</strong>
          <input
            type="text"
            value={destination}
            onChange={handleDestinationChange}
            style={{ marginLeft: '0.5rem', width: '300px' }}
          />
        </label>
        {destinationSuggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            width: '100%',
            maxHeight: '200px',
            overflowY: 'auto',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginTop: '4px'
          }}>
            {destinationSuggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => selectDestinationSuggestion(suggestion)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  color: '#333',
                  background: 'white'
                }}
              >
                {suggestion.formattedAddress}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Offer and Date */}
      <div>
        <label>
          <strong>{t('offer')} (optional):</strong>
          <input
            type="text"
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>
      </div>
      <div>
        <label>
          <strong>{t('date')}:</strong>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          />
        </label>
      </div>
      
      {/* Truck Mode */}
      <div>
        <label>
          <strong>{t('truckMode')}:</strong>
          <select
            value={truckMode}
            onChange={(e) => setTruckMode(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="medium_truck">Medium-size Truck (7.5t, 4.1m)</option>
            <option value="truck">Truck (22t, 4.1m)</option>
            <option value="heavy_truck">Heavy Truck (40t, 4.1m)</option>
            <option value="truck_dangerous_goods">Truck with Dangerous Goods (22t, 4.1m)</option>
            <option value="long_truck">Long Truck (22t, 4.1m, max 34m)</option>
          </select>
        </label>
        <p style={{ fontSize: '0.9em', color: '#555' }}>{descriptions[truckMode]}</p>
      </div>
      
      {/* Reset Button */}
      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={handleReset}
          style={{ padding: '6px 12px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          {t('startNewRoute')}
        </button>
      </div>
      
      {/* Intermediate Waypoints */}
      <div style={{ marginTop: '1rem' }}>
        <h3>{t('intermediateWaypoints')}</h3>
        <button onClick={addWaypoint} style={{ marginBottom: '0.5rem' }}>{t('addWaypoint')}</button>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleOnDragEnd}>
          <SortableContext items={waypoints.map((wp) => wp.id)} strategy={verticalListSortingStrategy}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {waypoints.map((wp, index) => (
                <SortableWaypoint key={wp.id} id={wp.id} index={index} waypoint={wp} onUpdate={updateWaypoint} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
      
      {/* Analyze Route Button */}
      <button onClick={handleAnalyzeRoute} style={{ marginTop: '1rem', padding: '8px 16px' }}>
        {t('analyzeRoute')}
      </button>
      
      {isLoading && (
        <div style={{ marginTop: '1rem', fontStyle: 'italic' }}>
          {t('loadingAssistantAnalysis')}
        </div>
      )}
      
      {assistantRouteInfo && (
        <div style={{
          marginTop: '1rem',
          background: '#e8f4fd',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            borderBottom: '1px solid #ccc',
            paddingBottom: '8px',
            marginBottom: '16px'
          }}>
            {t('routeAnalysis')}
          </h3>
          {assistantRouteInfo.split('\n').map((line, index) => (
            line.trim() !== '' && <p key={index} style={{ margin: '8px 0', lineHeight: 1.5 }}>{line}</p>
          ))}
        </div>
      )}
      
      {/* Additional Q&A Section */}
      {additionalQuestions.length > 0 && additionalQuestions.map((qa, index) => (
  <div
    key={index}
    style={{
      marginTop: '1rem',
      background: '#e8f4fd',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}
  >
    <h3 style={{
      borderBottom: '1px solid #ccc',
      paddingBottom: '8px',
      marginBottom: '16px'
    }}>
      {t('additionalQuestion')} #{index + 1}
    </h3>
    <div style={{
      background: '#f8f9fa',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px'
    }}>
      <strong>Q: </strong>{qa.question}
      <span style={{
        float: 'right',
        color: '#666',
        fontSize: '0.9em'
      }}>
        {qa.timestamp}
      </span>
    </div>
    <div style={{ 
      marginTop: '12px',
      background: '#ffffff',
      padding: '12px',
      borderRadius: '6px'
    }}>
      {qa.answer.split('\n').map((line, idx) => (
        line.trim() !== '' && (
          <p key={idx} style={{
            margin: '8px 0',
            lineHeight: 1.5
          }}>
            {line}
          </p>
        )
      ))}
    </div>
  </div>
))}

{/* Secțiunea de introducere întrebări noi - mutată sub răspunsuri */}
{assistantRouteInfo && (
  <div style={{ 
    marginTop: '1rem', 
    background: '#f0f8ff', 
    padding: '16px', 
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)' 
  }}>
    <h3>{t('additionalQuestions')} ({t('available')}: {availableQuestions})</h3>
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      <input
        type="text"
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !isAsking && newQuestion.trim() && availableQuestions > 0) {
            handleAskAdditionalQuestion();
          }
        }}
        placeholder={t('enterQuestionHere')}
        style={{
          flex: 1,
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
      />
      <button 
        onClick={handleAskAdditionalQuestion}
        disabled={isAsking || !newQuestion.trim() || availableQuestions <= 0}
        style={{
          padding: '8px 16px',
          borderRadius: '4px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          cursor: isAsking ? 'not-allowed' : 'pointer',
          opacity: isAsking ? 0.7 : 1
        }}
      >
        {isAsking ? t('processing') : t('ask')}
      </button>
    </div>
    {isAsking && <LoadingSpinner />}
  </div>
)}
      
      {/* Map */}
      <div style={{ marginTop: '2rem' }}>
        <h3>{t('map')}</h3>
        <MapComponent center={mapCenter} zoom={10} markers={markers} routeCoordinates={routeCoordinates} />
      </div>

      {routeInfo && (
        <div style={{ marginTop: '1rem', background: '#f9f9f9', padding: '8px', borderRadius: '4px' }}>
          <h3>{t('routeInformation')}</h3>
          <p>{t('distance')}: {routeInfo.distance ? (routeInfo.distance / 1000).toFixed(2) + ' km' : 'N/A'}</p>
          <p>{t('estimatedTime')}: {routeInfo.time ? (routeInfo.time / 3600).toFixed(2) + ' hours' : 'N/A'}</p>
        </div>
      )}

      {routeInfo && (
        <div style={{ marginTop: '1rem' }}>
          <button 
            onClick={saveCurrentRoute}
            style={{
              padding: '8px 16px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            {t('saveRoute')}
          </button>
          <button 
            onClick={() => setShowComparison(true)}
            disabled={savedRoutes.length === 0}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              opacity: savedRoutes.length === 0 ? 0.5 : 1
            }}
          >
            {t('compareRoutes')}
          </button>
        </div>
      )}

      {showComparison && savedRoutes.length > 0 && (
        <ComparisonTable routes={savedRoutes} />
      )}
    </div>
  );
}

export default Dashboard;
