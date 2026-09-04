import React, { useState } from 'react';
import { useDevices } from '../contexts/DeviceContext';

function SceneManager() {
  const { scenes, devices, activateScene, addScene, deleteScene, loading } = useDevices();
  const [activating, setActivating] = useState(null);
  const [message, setMessage] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newActions, setNewActions] = useState([]);
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const handleActivate = async (sceneId) => {
    setActivating(sceneId);
    setMessage(null);
    try {
      await activateScene(sceneId);
      setMessage({ type: 'success', text: 'Scene activated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to activate scene' });
    } finally {
      setActivating(null);
    }
  };

  const handleDelete = async (sceneId, name) => {
    if (!confirm(`Delete scene "${name}"?`)) return;
    try {
      await deleteScene(sceneId);
      setMessage({ type: 'success', text: `Scene "${name}" deleted` });
    } catch (e) {
      console.error(e);
    }
  };

  const addAction = () => {
    if (devices.length === 0) return;
    setNewActions(prev => [...prev, { device_id: devices[0].id, action: 'turn_on', brightness: 80, temperature: 72 }]);
  };

  const updateAction = (idx, field, value) => {
    setNewActions(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };

  const removeAction = (idx) => {
    setNewActions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateScene = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await addScene({ name: newName.trim(), description: newDesc.trim(), actions: newActions });
      setShowAdd(false);
      setNewName('');
      setNewDesc('');
      setNewActions([]);
      setMessage({ type: 'success', text: `Scene "${newName.trim()}" created!` });
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Scenes</h1>
        <p>Activate pre-configured device combinations</p>
      </div>

      {message && (
        <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
          {message.text}
        </div>
      )}

      <button className="btn btn-primary" style={{ marginBottom: 20 }} onClick={() => setShowAdd(!showAdd)}>
        {showAdd ? 'Cancel' : '+ New Scene'}
      </button>

      {showAdd && (
        <div className="modal-content" style={{ maxWidth: '100%', marginBottom: 24, animation: 'riseIn 0.3s ease' }}>
          <h2 style={{ marginTop: 0 }}>Create New Scene</h2>
          <form onSubmit={handleCreateScene}>
            <div className="form-group">
              <label>Scene Name</label>
              <input className="form-input" placeholder="e.g. Movie Night" value={newName} onChange={e => setNewName(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input className="form-input" placeholder="What this scene does" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Actions ({newActions.length})</label>
              {newActions.map((a, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select className="form-input" style={{ flex: '1 1 120px' }} value={a.device_id} onChange={e => updateAction(idx, 'device_id', e.target.value)}>
                    {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <select className="form-input" style={{ flex: '1 1 100px' }} value={a.action} onChange={e => updateAction(idx, 'action', e.target.value)}>
                    <option value="turn_on">Turn On</option>
                    <option value="turn_off">Turn Off</option>
                    <option value="set_brightness">Set Brightness</option>
                    <option value="set_temperature">Set Temperature</option>
                  </select>
                  {a.action === 'set_brightness' && (
                    <input className="form-input" style={{ width: 80 }} type="number" min="0" max="100" value={a.brightness} onChange={e => updateAction(idx, 'brightness', +e.target.value)} />
                  )}
                  {a.action === 'set_temperature' && (
                    <input className="form-input" style={{ width: 80 }} type="number" min="60" max="90" value={a.temperature} onChange={e => updateAction(idx, 'temperature', +e.target.value)} />
                  )}
                  <button type="button" className="btn btn-danger mini" onClick={() => removeAction(idx)}>✕</button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" style={{ marginTop: 4 }} onClick={addAction}>+ Add Action</button>
            </div>

            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Scene'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="scenes-grid">
        {scenes.map(scene => (
          <div key={scene.id} className="scene-card">
            <div className="scene-header">
              <div className="scene-name">
                <span role="img" aria-label="scene">✨</span>
                {scene.name}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={() => handleActivate(scene.id)} disabled={activating === scene.id}>
                  {activating === scene.id ? 'Activating...' : 'Activate'}
                </button>
                <button className="btn btn-danger mini" onClick={() => handleDelete(scene.id, scene.name)} title="Delete scene">🗑️</button>
              </div>
            </div>
            <div className="scene-description">{scene.description}</div>
            <div className="scene-actions">
              {scene.actions.map((action, index) => (
                <div key={index} className="scene-action">
                  {action.device_id}: {action.action}
                  {action.brightness && ` (${action.brightness}%)`}
                  {action.temperature && ` (${action.temperature}°F)`}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {scenes.length === 0 && (
        <div className="empty-state">
          <h2>No scenes available</h2>
          <p>Create scenes to automate your smart home</p>
        </div>
      )}
    </div>
  );
}

export default SceneManager;
