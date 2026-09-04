import React from 'react';
import { useDevices } from '../contexts/DeviceContext';
import DeviceCard from './DeviceCard';

function Favorites() {
  const { devices, loading } = useDevices();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const favorites = devices.filter(d => d.favorite);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Favorites</h1>
        <p>Your most-used devices, one tap away</p>
      </div>

      {favorites.length > 0 ? (
        <div className="devices-grid">
          {favorites.map(device => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⭐</div>
          <h2>No favorites yet</h2>
          <p>Tap the ★ on any device card to add it here.</p>
        </div>
      )}
    </div>
  );
}

export default Favorites;
