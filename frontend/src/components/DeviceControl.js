import React, { useState } from 'react';
import { useDevices } from '../contexts/DeviceContext';
import DeviceCard from './DeviceCard';

function DeviceControl() {
  const { devices, loading } = useDevices();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const filteredDevices = devices.filter(device => {
    const matchesFilter = filter === 'all' || device.type === filter;
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.room.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Device Control</h1>
        <p>Manage all your smart home devices</p>
      </div>

      <div className="controls-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'light' ? 'active' : ''}`}
            onClick={() => setFilter('light')}
          >
            Lights
          </button>
          <button 
            className={`filter-btn ${filter === 'thermostat' ? 'active' : ''}`}
            onClick={() => setFilter('thermostat')}
          >
            Thermostats
          </button>
          <button 
            className={`filter-btn ${filter === 'lock' ? 'active' : ''}`}
            onClick={() => setFilter('lock')}
          >
            Locks
          </button>
          <button 
            className={`filter-btn ${filter === 'camera' ? 'active' : ''}`}
            onClick={() => setFilter('camera')}
          >
            Cameras
          </button>
          <button 
            className={`filter-btn ${filter === 'sensor' ? 'active' : ''}`}
            onClick={() => setFilter('sensor')}
          >
            Sensors
          </button>
        </div>
      </div>

      <div className="devices-grid">
        {filteredDevices.map(device => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <div className="empty-state">
          <h2>No devices found</h2>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}

export default DeviceControl;
