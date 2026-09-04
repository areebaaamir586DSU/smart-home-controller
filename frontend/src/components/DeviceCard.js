import React from 'react';
import { useDevices } from '../contexts/DeviceContext';

const DEVICE_META = {
  light: { icon: '💡', color: '#ffd54f', accent: 'gold' },
  thermostat: { icon: '🌡️', color: '#4fc3f7', accent: 'cyan' },
  lock: { icon: '🔒', color: '#66bb6a', accent: 'green' },
  camera: { icon: '📹', color: '#ef5350', accent: 'red' },
  sensor: { icon: '📡', color: '#ab47bc', accent: 'purple' }
};

function DeviceCard({ device }) {
  const { toggleDevice, updateDevice, deleteDevice } = useDevices();
  const meta = DEVICE_META[device.type] || { icon: '🏠', color: '#4fc3f7', accent: 'cyan' };
  const isActive = () => device.status !== 'off' && device.status !== 'inactive' && device.status !== 'idle';
  const active = isActive();

  const handleToggle = async () => {
    try { await toggleDevice(device.id); } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${device.name}"?`)) {
      try { await deleteDevice(device.id); } catch (e) { console.error(e); }
    }
  };

  const handleBrightness = async (e) => {
    try { await updateDevice(device.id, { brightness: parseInt(e.target.value) }); } catch (e) {}
  };

  const handleTemperature = async (e) => {
    try { await updateDevice(device.id, { temperature: parseInt(e.target.value) }); } catch (e) {}
  };

  const getStatusText = () => {
    switch (device.type) {
      case 'light': return device.status === 'on' ? 'On' : 'Off';
      case 'thermostat': return device.status === 'on' ? `${device.temperature}°F` : 'Off';
      case 'lock': return device.status === 'locked' ? 'Locked' : 'Unlocked';
      case 'camera': return device.status === 'recording' ? 'Recording' : 'Idle';
      case 'sensor': return device.status === 'active' ? 'Active' : 'Inactive';
      default: return device.status;
    }
  };

  return (
    <div className={`device-card neon ${active ? 'active' : ''} accent-${meta.accent}`}>
      <div className="device-glow"></div>
      <div className="device-header">
        <div className="device-icon" style={{ background: `${meta.color}22`, borderColor: meta.color }}>
          <span>{meta.icon}</span>
        </div>
        <div className="device-title">
          <div className="device-name">{device.name}</div>
          <div className="device-room">{device.room}</div>
        </div>
        <div className="device-status-wrap">
          <div className={`device-status ${active ? 'on' : 'off'}`} style={active ? { color: meta.color } : {}}>
            {active && <span className="pulse-dot"></span>}
            {getStatusText()}
          </div>
        </div>
      </div>

      {device.type === 'light' && (
        <div className="slider-control">
          <label className="slider-label">Brightness</label>
          <input
            type="range"
            className="neon-slider"
            min="0" max="100"
            value={device.brightness}
            onChange={handleBrightness}
            style={{ '--val': `${device.brightness}%`, '--c': meta.color }}
          />
          <span className="slider-value">{device.brightness}%</span>
        </div>
      )}

      {device.type === 'thermostat' && (
        <>
          <div className="slider-control">
            <label className="slider-label">Temperature</label>
            <input
              type="range"
              className="neon-slider"
              min="60" max="85"
              value={device.temperature}
              onChange={handleTemperature}
              style={{ '--val': `${((device.temperature - 60) / 25) * 100}%`, '--c': meta.color }}
            />
            <span className="slider-value">{device.temperature}°F</span>
          </div>
          <div className="device-meta">
            <span className="meta-chip">💦 {device.humidity}%</span>
            <span className="meta-chip">Mode: {device.mode}</span>
          </div>
        </>
      )}

      {device.type === 'lock' && (
        <div className="device-meta">
          <span className="meta-chip">🔋 Battery {device.battery}%</span>
        </div>
      )}

      {device.type === 'camera' && (
        <div className="device-meta">
          <span className="meta-chip">🎥 Motion: {device.motion_detection ? 'On' : 'Off'}</span>
          <span className="meta-chip">🌙 Night: {device.night_vision ? 'On' : 'Off'}</span>
        </div>
      )}

      {device.type === 'sensor' && (
        <div className="device-meta">
          <span className="meta-chip">Sensitivity: {device.sensitivity}</span>
        </div>
      )}

      <div className="device-controls">
        <label className="switch big" style={{ '--c': meta.color }}>
          <input type="checkbox" checked={active} onChange={handleToggle} />
          <span className="slider round"></span>
        </label>
        <div className="control-label">{active ? 'TURN OFF' : 'TURN ON'}</div>
        <button className="btn btn-danger mini" onClick={handleDelete} title="Delete device">🗑️</button>
      </div>
    </div>
  );
}

export default DeviceCard;
