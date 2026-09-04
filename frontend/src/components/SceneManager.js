import React, { useState } from 'react';
import { useDevices } from '../contexts/DeviceContext';

function SceneManager() {
  const { scenes, activateScene, loading } = useDevices();
  const [activating, setActivating] = useState(null);
  const [message, setMessage] = useState(null);

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

      <div className="scenes-grid">
        {scenes.map(scene => (
          <div key={scene.id} className="scene-card">
            <div className="scene-header">
              <div className="scene-name">
                <span role="img" aria-label="scene">✨</span>
                {scene.name}
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleActivate(scene.id)}
                disabled={activating === scene.id}
              >
                {activating === scene.id ? 'Activating...' : 'Activate'}
              </button>
            </div>

            <div className="scene-description">
              {scene.description}
            </div>

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
