import React, { useState } from 'react';
import { useDevices } from '../contexts/DeviceContext';
import DeviceCard from './DeviceCard';
import AddDeviceModal from './AddDeviceModal';

function Dashboard() {
  const { devices, stats, loading } = useDevices();
  const [showAdd, setShowAdd] = useState(false);

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

      {stats && stats.monthly_cost && (
        <div className="cost-panel">
          <div className="cost-title">💡 Estimated Monthly Cost</div>
          <div className="cost-value">${stats.monthly_cost.toFixed(2)} <small style={{fontSize:'0.5em'}}>/ month</small></div>
          <div className="cost-top">
            {Object.values(stats.perDeviceCost || {}).sort((a, b) => b.monthlyKwh - a.monthlyKwh).slice(0, 4).map(d => (
              <div key={d.name} className="cost-chip">{d.name}: {d.monthlyKwh}kWh · ${d.monthlyCost}</div>
            ))}
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
        <button className="btn-add-device" onClick={() => setShowAdd(true)}>
          <div className="add-icon">+</div>
          <span>Add New Device</span>
        </button>
      </div>

      {showAdd && <AddDeviceModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

export default Dashboard;
