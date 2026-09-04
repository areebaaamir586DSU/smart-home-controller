import React from 'react';
import { useDevices } from '../contexts/DeviceContext';

function Notifications() {
  const { notifications, clearNotifications, loading } = useDevices();

  if (loading) {
    return (
      <div className="loading"><div className="spinner"></div></div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '🔴';
      default: return 'ℹ️';
    }
  };

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Notifications</h1>
        <p>Activity and alerts from your home</p>
      </div>

      <div className="page-actions">
        <button className="btn btn-secondary" onClick={clearNotifications}>
          Clear All
        </button>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 && (
          <div className="empty-state">
            <h2>No notifications</h2>
            <p>Actions performed on your devices will appear here</p>
          </div>
        )}

        {notifications.map(n => (
          <div key={n.id} className={`notification-card ${n.type}`}>
            <span className="notification-icon">{getIcon(n.type)}</span>
            <div className="notification-content">
              <div className="notification-message">{n.message}</div>
              <div className="notification-time">{formatTime(n.time)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;
