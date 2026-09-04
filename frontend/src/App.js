import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DeviceProvider } from './contexts/DeviceContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DeviceControl from './components/DeviceControl';
import RoomView from './components/RoomView';
import SceneManager from './components/SceneManager';
import Navbar from './components/Navbar';
import './App.css';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? 'main-content' : ''}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/devices" element={
            <PrivateRoute>
              <DeviceControl />
            </PrivateRoute>
          } />
          <Route path="/rooms" element={
            <PrivateRoute>
              <RoomView />
            </PrivateRoute>
          } />
          <Route path="/scenes" element={
            <PrivateRoute>
              <SceneManager />
            </PrivateRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DeviceProvider>
        <Router>
          <AppContent />
        </Router>
      </DeviceProvider>
    </AuthProvider>
  );
}

export default App;
