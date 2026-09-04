import React from 'react';
import { useDevices } from '../contexts/DeviceContext';
import DeviceCard from './DeviceCard';

function RoomView() {
  const { devices, rooms, loading } = useDevices();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const getDevicesByRoom = (room) => {
    return devices.filter(device => device.room === room);
  };

  const getActiveDevicesByRoom = (room) => {
    return getDevicesByRoom(room).filter(device => 
      device.status !== 'off' && device.status !== 'inactive' && device.status !== 'idle'
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Rooms</h1>
        <p>View and manage devices by room</p>
      </div>

      {rooms.map(room => (
        <div key={room} className="room-card">
          <div className="room-header">
            <h2>
              <span role="img" aria-label="room">🏠</span>
              {room}
            </h2>
            <div className="room-stats">
              <div className="room-stat">
                <div className="value">{getDevicesByRoom(room).length}</div>
                <div className="label">Devices</div>
              </div>
              <div className="room-stat">
                <div className="value">{getActiveDevicesByRoom(room).length}</div>
                <div className="label">Active</div>
              </div>
            </div>
          </div>

          <div className="devices-grid">
            {getDevicesByRoom(room).map(device => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>

          {getDevicesByRoom(room).length === 0 && (
            <div className="empty-state">
              <p>No devices in this room</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default RoomView;
