import React, { useState, useMemo } from 'react';
import { useDevices } from '../contexts/DeviceContext';
import DeviceCard from './DeviceCard';
import AddDeviceModal from './AddDeviceModal';

const DEVICE_TYPES = ['all', 'light', 'thermostat', 'lock', 'camera', 'speaker', 'sensor', 'ac'];

function DeviceControl() {
  const { devices, rooms, loading } = useDevices();
  const [filter, setFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const filteredDevices = useMemo(() => {
    let list = devices.filter(device => {
      const matchesType = filter === 'all' || device.type === filter;
      const matchesRoom = roomFilter === 'all' || device.room === roomFilter;
      const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           device.room.toLowerCase().includes(searchTerm.toLowerCase());
      const isActive = device.status !== 'off' && device.status !== 'inactive';
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);
      return matchesType && matchesRoom && matchesSearch && matchesStatus;
    });

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'type') return a.type.localeCompare(b.type);
      if (sortBy === 'room') return a.room.localeCompare(b.room);
      return 0;
    });

    return list;
  }, [devices, filter, roomFilter, searchTerm, sortBy, statusFilter]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Device Control</h1>
        <p>Manage all your smart home devices</p>
      </div>

      <div className="controls-bar" style={{ flexWrap: 'wrap' }}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="form-input" style={{ width: 'auto', minWidth: 120 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="type">Sort by Type</option>
          <option value="room">Sort by Room</option>
        </select>

        <select className="form-input" style={{ width: 'auto', minWidth: 120 }} value={roomFilter} onChange={e => setRoomFilter(e.target.value)}>
          <option value="all">All Rooms</option>
          {rooms.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select className="form-input" style={{ width: 'auto', minWidth: 120 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => setShowAdd(true)}>
          + Add Device
        </button>
      </div>

      <div className="filter-buttons">
        {DEVICE_TYPES.map(t => (
          <button
            key={t}
            className={`filter-btn ${filter === t ? 'active' : ''}`}
            onClick={() => setFilter(t)}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="devices-grid">
        {filteredDevices.map(device => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <div className="empty-state">
          <h2>No devices found</h2>
          <p>Try adjusting your search or filter criteria, or add a new device.</p>
        </div>
      )}

      {showAdd && <AddDeviceModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

export default DeviceControl;
