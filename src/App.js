// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { AuthContainer } from './components/Auth/AuthContainer';
import { UserProvider } from './contexts/UserContext';
import 'leaflet/dist/leaflet.css';
import './components/MapComponent.css';
import './components/WaypointInput.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return !user ? (
    <AuthContainer />
  ) : (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </UserProvider>
  );
}

export default App;
