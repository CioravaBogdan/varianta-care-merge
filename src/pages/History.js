// src/pages/History.js
import React, { useState, useEffect } from 'react';
import { routesService } from '../services/routes';

function History() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRoute, setEditingRoute] = useState(null);
  const [newOffer, setNewOffer] = useState('');
  const [expandedRoute, setExpandedRoute] = useState(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const data = await routesService.getRoutes();
      setRoutes(data);
    } catch (error) {
      console.error('Error loading routes:', error);
      alert('Could not load routes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOffer = async (id) => {
    try {
      await routesService.updateRoute(id, { offer: newOffer });
      setEditingRoute(null);
      setNewOffer('');
      await loadRoutes();
    } catch (error) {
      console.error('Error updating route:', error);
      alert('Could not update route');
    }
  };

  const handleRouteClick = (routeId) => {
    setExpandedRoute(expandedRoute === routeId ? null : routeId);
  };

  if (loading) return <div>Loading routes...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Route History</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {routes.map((route) => (
          <div
            key={route.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
          >
            {/* Summary Tab */}
            <div
              onClick={() => handleRouteClick(route.id)}
              style={{
                padding: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: expandedRoute === route.id ? '#f0f8ff' : '#fff',
                borderBottom: expandedRoute === route.id ? '1px solid #ddd' : 'none'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                <span>{route.departure} → {route.destination}</span>
                <span>|</span>
                <span>Distance: {(route.route_details?.distance / 1000).toFixed(2)} km</span>
                <span>|</span>
                <span>Offer: {route.offer || 'Not set'}</span>
              </div>
              <span style={{ marginLeft: '1rem' }}>
                {expandedRoute === route.id ? '▼' : '▶'}
              </span>
            </div>

            {/* Expanded Details */}
            {expandedRoute === route.id && (
              <div style={{ padding: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <p>Date: {new Date(route.created_at).toLocaleDateString()}</p>
                  <p>Truck Type: {route.truck_mode}</p>
                  {route.route_details && (
                    <>
                      <p>Duration: {(route.route_details.time / 3600).toFixed(2)} hours</p>
                    </>
                  )}
                </div>

                {/* Offer Editor */}
                <div style={{ marginBottom: '1rem' }}>
                  {editingRoute === route.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={newOffer}
                        onChange={(e) => setNewOffer(e.target.value)}
                        placeholder="New offer amount"
                        style={{ padding: '0.5rem' }}
                      />
                      <button
                        onClick={() => handleUpdateOffer(route.id)}
                        style={{
                          background: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingRoute(null)}
                        style={{
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingRoute(route.id);
                        setNewOffer(route.offer || '');
                      }}
                      style={{
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit Offer
                    </button>
                  )}
                </div>

                {/* AI Analysis */}
                <div>
                  <h4>AI Analysis</h4>
                  <div style={{
                    background: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {route.ai_analysis.split('\n').map((line, idx) => (
                      line.trim() !== '' && (
                        <p key={idx} style={{ margin: '0.5rem 0' }}>
                          {line}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
