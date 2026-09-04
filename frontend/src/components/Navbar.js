import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDevices } from '../contexts/DeviceContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { notifications } = useDevices();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const unread = notifications.length;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span role="img" aria-label="home">🏠</span>
        <span>Smart Home</span>
      </div>

      <div className="navbar-links">
        <Link to="/" className={isActive('/') ? 'active' : ''}>Dashboard</Link>
        <Link to="/devices" className={isActive('/devices') ? 'active' : ''}>Devices</Link>
        <Link to="/favorites" className={isActive('/favorites') ? 'active' : ''}>Favorites ⭐</Link>
        <Link to="/rooms" className={isActive('/rooms') ? 'active' : ''}>Rooms</Link>
        <Link to="/scenes" className={isActive('/scenes') ? 'active' : ''}>Scenes</Link>
        <Link to="/automations" className={isActive('/automations') ? 'active' : ''}>Automations</Link>
        <Link to="/analytics" className={isActive('/analytics') ? 'active' : ''}>Analytics</Link>
        <Link to="/notifications" className={isActive('/notifications') ? 'active' : ''}>
          Alerts {unread > 0 && <span className="badge">{unread}</span>}
        </Link>
      </div>

      <div className="navbar-user">
        <span style={{ marginRight: '15px', color: '#b0bec5' }}>
          {user?.username} ({user?.role})
        </span>
        <button className="btn btn-secondary" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
