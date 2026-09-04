import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from './AuthContext';

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      newSocket.on('device_update', (updatedDevice) => {
        setDevices(prev => prev.map(device => 
          device.id === updatedDevice.id ? updatedDevice : device
        ));
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated]);

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
      return response.data;
    } catch (error) {
      console.error('Failed to toggle device:', error);
      throw error;
    }
  };

  const activateScene = async (sceneId) => {
    try {
      await api.post(`/scenes/${sceneId}/activate`);
      await fetchDevices();
      return true;
    } catch (error) {
      console.error('Failed to activate scene:', error);
      throw error;
    }
  };

  const getDevicesByRoom = (room) => {
    return devices.filter(device => device.room === room);
  };

  const getDevicesByType = (type) => {
    return devices.filter(device => device.type === type);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchDevices(),
          fetchRooms(),
          fetchScenes(),
          fetchStats()
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
      loading,
      socket,
      updateDevice,
      toggleDevice,
      activateScene,
      getDevicesByRoom,
      getDevicesByType,
      fetchDevices,
      fetchRooms,
      fetchScenes,
      fetchStats
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
