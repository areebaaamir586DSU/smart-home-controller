import React, { useState } from 'react';
import { useDevices } from '../contexts/DeviceContext';

const timeOptions = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    timeOptions.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

function Automations() {
  const { automations, devices, addAutomation, updateAutomation, deleteAutomation, loading } = useDevices();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    time: '07:00',
    device_id: 'light_1',
    action: 'on',
    brightness: 80,
    temperature: 72
  });
  const [message, setMessage] = useState(null);

  if (loading) {
    return (
      <div className="loading"><div className="spinner"></div></div>
    );
  }

  const toggleEnabled = async (auto) => {
    try {
      await updateAutomation(auto.id, { enabled: !auto.enabled });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await addAutomation(form);
      setShowForm(false);
      setForm({ name: '', time: '07:00', device_id: 'light_1', action: 'on', brightness: 80, temperature: 72 });
      setMessage({ type: 'success', text: 'Automation added!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add automation' });
    }
  };

  const actionLabel = (a) => {
    const device = devices.find(d => d.id === a.device_id);
    const name = device ? device.name : a.device_id;
    if (a.action === 'set') return `${name} → ${a.temperature}°F`;
    return `${name} → ${a.action}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Automations</h1>
        <p>Schedule actions for your devices</p>
      </div>

      {message && (
        <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
          {message.text}
        </div>
      )}

      <div className="page-actions">
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Automation'}
        </button>
      </div>

      {showForm && (
        <form className="automation-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Morning Coffee"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Time</label>
              <select
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              >
                {timeOptions.map(t => (
                  <option key={t} value={t} style={{ color: '#000' }}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Device</label>
              <select
                value={form.device_id}
                onChange={(e) => setForm({ ...form, device_id: e.target.value })}
                style={{ color: '#000' }}
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id} style={{ color: '#000' }}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Action</label>
              <select
                value={form.action}
                onChange={(e) => setForm({ ...form, action: e.target.value })}
                style={{ color: '#000' }}
              >
                <option value="on" style={{ color: '#000' }}>Turn On</option>
                <option value="off" style={{ color: '#000' }}>Turn Off</option>
                <option value="lock" style={{ color: '#000' }}>Lock</option>
                <option value="unlock" style={{ color: '#000' }}>Unlock</option>
                <option value="set" style={{ color: '#000' }}>Set Temp</option>
              </select>
            </div>
          </div>

          {form.action === 'on' && (
            <div className="form-group">
              <label>Brightness: {form.brightness}%</label>
              <input
                type="range"
                min="0" max="100"
                value={form.brightness}
                onChange={(e) => setForm({ ...form, brightness: parseInt(e.target.value) })}
              />
            </div>
          )}

          {form.action === 'set' && (
            <div className="form-group">
              <label>Temperature: {form.temperature}°F</label>
              <input
                type="range"
                min="60" max="85"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: parseInt(e.target.value) })}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary">Save Automation</button>
        </form>
      )}

      <div className="automations-list">
        {automations.length === 0 && (
          <div className="empty-state">
            <h2>No automations yet</h2>
            <p>Create your first automation to get started</p>
          </div>
        )}

        {automations.map(auto => (
          <div key={auto.id} className="automation-card">
            <div className="automation-info">
              <div className="automation-name">
                <span role="img" aria-label="clock">⏰</span> {auto.name}
              </div>
              <div className="automation-details">
                <span className="automation-time">{auto.time}</span>
                <span className="automation-action">{actionLabel(auto)}</span>
              </div>
            </div>
            <div className="automation-controls">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={auto.enabled}
                  onChange={() => toggleEnabled(auto)}
                />
                <span className="slider round"></span>
              </label>
              <button
                className="btn btn-danger"
                onClick={() => deleteAutomation(auto.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Automations;
