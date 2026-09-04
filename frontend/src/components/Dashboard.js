import React from 'react';
import { useDevices } from '../contexts/DeviceContext';
import DeviceCard from './DeviceCard';

function Dashboard() {
  const { devices, stats, loading } = useDevices();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to your Smart Home Controller</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Devices</h3>
            <div className="value">{stats.total_devices}</div>
          </div>
          <div className="stat-card">
            <h3>Active Devices</h3>
            <div className="value">{stats.active_devices}</div>
          </div>
          <div className="stat-card">
            <h3>Rooms</h3>
            <div className="value">{Object.keys(stats.rooms).length}</div>
          </div>
          <div className="stat-card">
            <h3>Energy Today</h3>
            <div className="value">{stats.today_energy} <small style={{fontSize:'0.5em'}}>kWh</small></div>
          </div>
        </div>
      )}

      <div className="section-header">
        <h2>All Devices</h2>
      </div>

      <div className="devices-grid">
        {devices.map(device => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
