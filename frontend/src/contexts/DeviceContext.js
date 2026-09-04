import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [stats, setStats] = useState(null);
  const [energy, setEnergy] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchDevices = async () => {
    try {
      const response = await api.get('/devices');
      setDevices(response.data);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const fetchScenes = async () => {
    try {
      const response = await api.get('/scenes');
      setScenes(response.data);
    } catch (error) {
      console.error('Failed to fetch scenes:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchEnergy = async () => {
    try {
      const response = await api.get('/energy');
      setEnergy(response.data);
    } catch (error) {
      console.error('Failed to fetch energy:', error);
    }
  };

  const fetchAutomations = async () => {
    try {
      const response = await api.get('/automations');
      setAutomations(response.data);
    } catch (error) {
      console.error('Failed to fetch automations:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const updateDevice = async (deviceId, updates) => {
    try {
      const response = await api.put(`/devices/${deviceId}`, updates);
      setDevices(prev => prev.map(device =>
        device.id === deviceId ? response.data : device
      ));
      return response.data;
    } catch (error) {
      console.error('Failed to update device:', error);
      throw error;
    }
  };

  const toggleDevice = async (deviceId) => {
    try {
      const response = await api.post(`/devices/${deviceId}/toggle`);
      setDevices(prev => prev.map(device =>
        device.id === deviceId ? response.data : device
      ));
      fetchNotifications();
      return response.data;
    } catch (error) {
      console.error('Failed to toggle device:', error);
      throw error;
    }
  };

  const activateScene = async (sceneId) => {
    try {
      await api.post(`/scenes/${sceneId}/activate`);
      await Promise.all([fetchDevices(), fetchNotifications()]);
      return true;
    } catch (error) {
      console.error('Failed to activate scene:', error);
      throw error;
    }
  };

  const addAutomation = async (data) => {
    try {
      const response = await api.post('/automations', data);
      setAutomations(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Failed to add automation:', error);
      throw error;
    }
  };

  const updateAutomation = async (automationId, data) => {
    try {
      const response = await api.put(`/automations/${automationId}`, data);
      setAutomations(prev => prev.map(a => a.id === automationId ? response.data : a));
      return response.data;
    } catch (error) {
      console.error('Failed to update automation:', error);
      throw error;
    }
  };

  const deleteAutomation = async (automationId) => {
    try {
      await api.delete(`/automations/${automationId}`);
      setAutomations(prev => prev.filter(a => a.id !== automationId));
    } catch (error) {
      console.error('Failed to delete automation:', error);
      throw error;
    }
  };

  const clearNotifications = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const getDevicesByRoom = (room) => {
    return devices.filter(device => device.room === room);
  };

  const getDevicesByType = (type) => {
    return devices.filter(device => device.type === type);
  };

  const addDevice = async (data) => {
    try {
      const response = await api.post('/devices', data);
      setDevices(prev => [...prev, response.data]);
      const room = response.data.room;
      if (!rooms.includes(room)) setRooms(prev => [...prev, room]);
      fetchStats();
      fetchNotifications();
      return response.data;
    } catch (error) {
      console.error('Failed to add device:', error);
      throw error;
    }
  };

  const deleteDevice = async (deviceId) => {
    try {
      await api.delete(`/devices/${deviceId}`);
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      fetchStats();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete device:', error);
      throw error;
    }
  };

  const addScene = async (data) => {
    try {
      const response = await api.post('/scenes', data);
      setScenes(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Failed to add scene:', error);
      throw error;
    }
  };

  const deleteScene = async (sceneId) => {
    try {
      await api.delete(`/scenes/${sceneId}`);
      setScenes(prev => prev.filter(s => s.id !== sceneId));
    } catch (error) {
      console.error('Failed to delete scene:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchDevices(),
          fetchRooms(),
          fetchScenes(),
          fetchStats(),
          fetchEnergy(),
          fetchAutomations(),
          fetchNotifications()
        ]);
        setLoading(false);
      };
      loadData();
    }
  }, [isAuthenticated]);

  return (
    <DeviceContext.Provider value={{
      devices,
      rooms,
      scenes,
      stats,
      energy,
      automations,
      notifications,
      loading,
      updateDevice,
      toggleDevice,
      activateScene,
      addDevice,
      deleteDevice,
      addScene,
      deleteScene,
      addAutomation,
      updateAutomation,
      deleteAutomation,
      clearNotifications,
      getDevicesByRoom,
      getDevicesByType,
      fetchDevices,
      fetchRooms,
      fetchScenes,
      fetchStats,
      fetchEnergy,
      fetchAutomations,
      fetchNotifications
    }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
}
