import React from 'react';
import { useDevices } from '../contexts/DeviceContext';

function DeviceCard({ device }) {
  const { toggleDevice, updateDevice } = useDevices();

  const handleToggle = async () => {
    try {
      await toggleDevice(device.id);
    } catch (error) {
      console.error('Failed to toggle device:', error);
    }
  };

  const handleBrightnessChange = async (e) => {
    try {
      await updateDevice(device.id, { brightness: parseInt(e.target.value) });
    } catch (error) {
      console.error('Failed to update brightness:', error);
    }
  };

  const handleTemperatureChange = async (e) => {
    try {
      await updateDevice(device.id, { temperature: parseInt(e.target.value) });
    } catch (error) {
      console.error('Failed to update temperature:', error);
    }
  };

  const isActive = () => {
    return device.status !== 'off' && device.status !== 'inactive' && device.status !== 'idle';
  };

  const getStatusText = () => {
    switch (device.type) {
      case 'light':
        return device.status === 'on' ? 'On' : 'Off';
      case 'thermostat':
        return device.status === 'on' ? `${device.temperature}°F` : 'Off';
      case 'lock':
        return device.status === 'locked' ? 'Locked' : 'Unlocked';
      case 'camera':
        return device.status === 'recording' ? 'Recording' : 'Idle';
      case 'sensor':
        return device.status === 'active' ? 'Active' : 'Inactive';
      default:
        return device.status;
    }
  };

  return (
    <div className={`device-card ${isActive() ? 'active' : ''}`}>
      <div className="device-header">
        <div className="device-name">{device.name}</div>
        <div className={`device-status ${isActive() ? 'on' : 'off'}`}>
          {getStatusText()}
        </div>
      </div>

      <div className="device-info">
        <p>Room: {device.room}</p>
        <p>Type: {device.type}</p>
      </div>

      {device.type === 'light' && (
        <div className="slider-control">
          <label>Brightness: {device.brightness}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={device.brightness}
            onChange={handleBrightnessChange}
          />
        </div>
      )}

      {device.type === 'thermostat' && (
        <div className="slider-control">
          <label>Temperature: {device.temperature}°F</label>
          <input
            type="range"
            min="60"
            max="85"
            value={device.temperature}
            onChange={handleTemperatureChange}
          />
        </div>
      )}

      {device.type === 'thermostat' && (
        <div className="device-info">
          <p>Humidity: {device.humidity}%</p>
          <p>Mode: {device.mode}</p>
        </div>
      )}

      {device.type === 'lock' && (
        <div className="device-info">
          <p>Battery: {device.battery}%</p>
        </div>
      )}

      {device.type === 'camera' && (
        <div className="device-info">
          <p>Motion Detection: {device.motion_detection ? 'On' : 'Off'}</p>
          <p>Night Vision: {device.night_vision ? 'On' : 'Off'}</p>
        </div>
      )}

      {device.type === 'sensor' && (
        <div className="device-info">
          <p>Sensitivity: {device.sensitivity}</p>
        </div>
      )}

      <div className="device-controls">
        <button 
          className="control-btn toggle"
          onClick={handleToggle}
        >
          {isActive() ? 'Turn Off' : 'Turn On'}
        </button>
      </div>
    </div>
  );
}

export default DeviceCard;
