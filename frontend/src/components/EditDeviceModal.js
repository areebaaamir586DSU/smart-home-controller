import React, { useState } from 'react';
import { useDevices } from '../contexts/DeviceContext';

const DEVICE_TYPES = [
  { value: 'light', label: 'Light', icon: '💡' },
  { value: 'thermostat', label: 'Thermostat', icon: '🌡️' },
  { value: 'lock', label: 'Smart Lock', icon: '🔒' },
  { value: 'camera', label: 'Camera', icon: '📹' },
  { value: 'speaker', label: 'Speaker', icon: '🔊' },
  { value: 'sensor', label: 'Sensor', icon: '📡' },
  { value: 'ac', label: 'AC', icon: '❄️' },
];

export default function EditDeviceModal({ device, onClose }) {
  const { updateDevice, rooms } = useDevices();
  const [name, setName] = useState(device.name || '');
  const [type, setType] = useState(device.type || 'light');
  const [room, setRoom] = useState(device.room || '');
  const [useNewRoom, setUseNewRoom] = useState(false);
  const [newRoom, setNewRoom] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalRoom = useNewRoom ? newRoom.trim() : room;
    if (!name.trim() || !finalRoom) return;
    setSaving(true);
    try {
      await updateDevice(device.id, { name: name.trim(), type, room: finalRoom });
      onClose();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Edit Device</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Device Name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required autoFocus />
          </div>

          <div className="form-group">
            <label>Device Type</label>
            <div className="device-type-grid">
              {DEVICE_TYPES.map(dt => (
                <button
                  key={dt.value}
                  type="button"
                  className={`device-type-btn ${type === dt.value ? 'active' : ''}`}
                  onClick={() => setType(dt.value)}
                >
                  <span>{dt.icon}</span>
                  <span>{dt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Room</label>
            {!useNewRoom ? (
              <select className="form-input" value={room} onChange={e => {
                if (e.target.value === '__new__') { setUseNewRoom(true); setNewRoom(''); }
                else setRoom(e.target.value);
              }} required>
                <option value="">Select a room</option>
                {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                <option value="__new__">+ Add New Room</option>
              </select>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="form-input" placeholder="New room name" value={newRoom} onChange={e => setNewRoom(e.target.value)} required autoFocus />
                <button type="button" className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={() => { setUseNewRoom(false); setRoom(''); }}>Back</button>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
