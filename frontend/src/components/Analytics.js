import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useDevices } from '../contexts/DeviceContext';

function Analytics() {
  const { energy, stats, devices, loading } = useDevices();

  if (loading) {
    return (
      <div className="loading"><div className="spinner"></div></div>
    );
  }

  const energyData = energy.map((e, i) => ({
    day: `Day ${i + 1}`,
    energy: e.energy,
    temp: e.temp
  }));

  const typeCounts = {};
  devices.forEach(d => {
    typeCounts[d.type] = (typeCounts[d.type] || 0) + 1;
  });
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#4fc3f7', '#66bb6a', '#ffa726', '#ef5350', '#ab47bc', '#26c6da'];

  const totalEnergy = energy.reduce((s, e) => s + e.energy, 0);
  const avgEnergy = energy.length ? Math.round(totalEnergy / energy.length) : 0;
  const peakEnergy = energy.length ? Math.max(...energy.map(e => e.energy)) : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Analytics</h1>
        <p>Energy usage and home insights</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Today's Energy</h3>
          <div className="value">{stats?.today_energy || 0} kWh</div>
        </div>
        <div className="stat-card">
          <h3>Total (14 days)</h3>
          <div className="value">{totalEnergy} kWh</div>
        </div>
        <div className="stat-card">
          <h3>Daily Average</h3>
          <div className="value">{avgEnergy} kWh</div>
        </div>
        <div className="stat-card">
          <h3>Peak Usage</h3>
          <div className="value">{peakEnergy} kWh</div>
        </div>
      </div>

      <div className="chart-card">
        <h2>Energy Usage (kWh per day)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={energyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" stroke="#b0bec5" />
            <YAxis stroke="#b0bec5" />
            <Tooltip contentStyle={{ background: '#16213e', border: 'none', borderRadius: 8 }} />
            <Legend />
            <Area type="monotone" dataKey="energy" stroke="#4fc3f7" fill="#4fc3f7" fillOpacity={0.3} name="Energy (kWh)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h2>Temperature Trend (°F)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={energyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" stroke="#b0bec5" />
            <YAxis stroke="#b0bec5" />
            <Tooltip contentStyle={{ background: '#16213e', border: 'none', borderRadius: 8 }} />
            <Legend />
            <Line type="monotone" dataKey="temp" stroke="#66bb6a" name="Temp (°F)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="charts-row">
        <div className="chart-card half">
          <h2>Devices by Type</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {pieData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#16213e', border: 'none', borderRadius: 8 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card half">
          <h2>Devices Count</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#b0bec5" />
              <YAxis stroke="#b0bec5" />
              <Tooltip contentStyle={{ background: '#16213e', border: 'none', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#ffa726" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
