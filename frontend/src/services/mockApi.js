// Mock API adapter - provides a full backend simulation so the
// frontend runs standalone (e.g. on GitHub Pages) without Flask.
// Uses localStorage for persistence so device state/user data survive reloads.

const STORAGE_KEY = 'smart_home_state_v1';

// ---- Default seed state ----
const defaultState = () => ({
  devices: {
    light_1: { id: "light_1", name: "Living Room Light", type: "light", room: "Living Room", status: "on", brightness: 80, color: "#FFFFFF" },
    light_2: { id: "light_2", name: "Bedroom Light", type: "light", room: "Bedroom", status: "off", brightness: 50, color: "#FFD700" },
    light_3: { id: "light_3", name: "Kitchen Light", type: "light", room: "Kitchen", status: "off", brightness: 60, color: "#FFFFFF" },
    thermostat_1: { id: "thermostat_1", name: "Main Thermostat", type: "thermostat", room: "Living Room", status: "on", temperature: 72, mode: "auto", humidity: 45 },
    thermostat_2: { id: "thermostat_2", name: "Bedroom Thermostat", type: "thermostat", room: "Bedroom", status: "on", temperature: 68, mode: "auto", humidity: 40 },
    lock_1: { id: "lock_1", name: "Front Door Lock", type: "lock", room: "Entrance", status: "locked", battery: 85 },
    camera_1: { id: "camera_1", name: "Front Door Camera", type: "camera", room: "Entrance", status: "recording", motion_detection: true, night_vision: true },
    sensor_1: { id: "sensor_1", name: "Motion Sensor", type: "sensor", room: "Hallway", status: "active", last_triggered: null, sensitivity: "medium" },
    sensor_2: { id: "sensor_2", name: "Door Sensor", type: "sensor", room: "Entrance", status: "active", last_triggered: null, sensitivity: "medium" }
  },
  users: {
    admin: { username: "admin", password: "admin123", role: "admin", email: "admin@home.com" }
  },
  currentUser: null,
  notifications: [],
  energyHistory: Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`,
    energy: Math.round(30 + Math.random() * 40 + (i % 3) * 5),
    temp: Math.round(68 + (i % 5) * 1.4),
    active: 3 + (i % 4)
  })),
  scenes: {
    scene_1: { id: "scene_1", name: "Good Morning", description: "Turn on lights and adjust thermostat", actions: [{ device_id: "light_1", action: "on", brightness: 100 }, { device_id: "thermostat_1", action: "on", temperature: 72 }] },
    scene_2: { id: "scene_2", name: "Good Night", description: "Turn off lights and lock doors", actions: [{ device_id: "light_1", action: "off" }, { device_id: "light_2", action: "off" }, { device_id: "lock_1", action: "lock" }] },
    scene_3: { id: "scene_3", name: "Away Mode", description: "Security mode when leaving home", actions: [{ device_id: "light_1", action: "off" }, { device_id: "light_2", action: "off" }, { device_id: "lock_1", action: "lock" }, { device_id: "camera_1", action: "record" }] },
    scene_4: { id: "scene_4", name: "Movie Night", description: "Dim lights for movie watching", actions: [{ device_id: "light_1", action: "on", brightness: 30 }, { device_id: "light_2", action: "off" }] }
  },
  automations: [
    { id: "auto_1", name: "Morning Wake-up", enabled: true, time: "07:00", device_id: "light_1", action: "on", brightness: 80 },
    { id: "auto_2", name: "Goodnight Lock", enabled: true, time: "22:30", device_id: "lock_1", action: "lock" },
    { id: "auto_3", name: "Thermostat Night", enabled: false, time: "23:00", device_id: "thermostat_1", action: "set", temperature: 66 }
  ]
});

// ---- Load/save state ----
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed);
  } catch (e) {
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore quota errors
  }
}

let state = loadState();

const defaultGet = (selector) => document.querySelector(selector);

export function mockAdapter(axiosInstance) {
  if (!axiosInstance || !axiosInstance.interceptors) return;

  axiosInstance.interceptors.request.use((config) => {
    config.adapter = async (cfg) => {
      await new Promise((r) => setTimeout(r, 120));
      const url = cfg.url || '';
      const method = (cfg.method || 'get').toLowerCase();
      const token = localStorage.getItem('token');
      const isAuthed = !!token;

      const ok = (data, status = 200) => ({
        data, status, statusText: status === 200 ? 'OK' : 'Success', headers: {}, config: cfg
      });
      const fail = (error, status) => ({
        data: { error }, status, statusText: 'Error', headers: {}, config: cfg
      });

      const body = () => {
        try { return cfg.data ? JSON.parse(cfg.data) : {}; } catch { return {}; }
      };

      const notif = (message, type = 'info') => {
        const n = { id: Date.now(), message, type, time: new Date().toISOString() };
        state.notifications.unshift(n);
        if (state.notifications.length > 50) state.notifications.pop();
        saveState(state);
      };

      // ================= AUTH =================
      if (url.includes('/auth/login') && method === 'post') {
        const b = body();
        const user = state.users[b.username];
        if (user && user.password === b.password) {
          saveState(state);
          return ok({ access_token: 'mock-token-' + Date.now(), user: { username: b.username, role: user.role, email: user.email } });
        }
        return fail('Invalid credentials', 401);
      }

      if (url.includes('/auth/register') && method === 'post') {
        const b = body();
        if (state.users[b.username]) return fail('Username already exists', 409);
        state.users[b.username] = { username: b.username, password: b.password, role: 'user', email: b.email || '' };
        state.notifications.unshift({ id: Date.now(), message: `New user ${b.username} registered`, type: 'info', time: new Date().toISOString() });
        saveState(state);
        return ok({ message: 'Registered successfully' });
      }

      if (url.includes('/auth/me') && method === 'get') {
        if (!isAuthed) return fail('Not authorized', 401);
        const username = token.replace('mock-token-', '');
        const u = Object.values(state.users).find(x => token.includes('mock-token-') && x.role);
        return ok({ username: state.currentUser?.username || 'admin', role: state.currentUser?.role || 'admin' });
      }

      if (!isAuthed) return fail('Not authorized', 401);

      // ================= USERS =================
      if (url.startsWith('/users') && method === 'get') {
        return ok(Object.values(state.users).map(u => ({ username: u.username, role: u.role, email: u.email })));
      }

      // ================= DEVICES =================
      if (url.startsWith('/devices') && method === 'get') {
        let list = Object.values(state.devices);
        const room = cfg.params?.room;
        const type = cfg.params?.type;
        if (room) list = list.filter(d => d.room === room);
        if (type) list = list.filter(d => d.type === type);
        return ok(list);
      }

      if (url.startsWith('/devices') && method === 'post') {
        const b = body();
        const sn = (b.name || 'Device').toLowerCase().replace(/\s+/g, '_');
        const id = `${b.type || 'device'}_${Date.now()}`;
        state.devices[id] = {
          id,
          name: b.name || 'New Device',
          type: b.type || 'light',
          room: b.room || 'Living Room',
          status: 'off',
          brightness: b.brightness || 100,
          temperature: b.temperature || 72,
          humidity: 45,
          mode: 'auto',
          battery: 100,
          motion_detection: true,
          night_vision: false,
          sensitivity: 'medium',
          ...(b.extra || {})
        };
        saveState(state);
        notif(`${state.devices[id].name} added`, 'success');
        return ok(state.devices[id]);
      }

      const deviceMatch = url.match(/\/devices\/([^/?]+)/);
      if (deviceMatch) {
        const id = deviceMatch[1];
        const dev = state.devices[id];
        if (!dev) return fail('Device not found', 404);

        if (method === 'get') return ok(dev);

        if (method === 'put') {
          const b = body();
          Object.assign(dev, b);
          saveState(state);
          notif(`${dev.name} updated`, 'info');
          return ok(dev);
        }

        if (method === 'delete') {
          const name = dev.name;
          delete state.devices[id];
          saveState(state);
          notif(`${name} deleted`, 'warning');
          return ok({ message: 'Device deleted' });
        }
      }

      if (url.includes('/toggle') && method === 'post') {
        const id = url.split('/devices/')[1].split('/')[0];
        const dev = state.devices[id];
        if (dev) {
          const prev = dev.status;
          if (dev.type === 'light') dev.status = dev.status === 'on' ? 'off' : 'on';
          else if (dev.type === 'lock') dev.status = dev.status === 'locked' ? 'unlocked' : 'locked';
          else if (dev.type === 'thermostat') dev.status = dev.status === 'on' ? 'off' : 'on';
          else if (dev.type === 'camera') dev.status = dev.status === 'recording' ? 'idle' : 'recording';
          else if (dev.type === 'sensor') dev.status = dev.status === 'active' ? 'inactive' : 'active';
          if (dev.type === 'sensor' && dev.status === 'active') dev.last_triggered = new Date().toISOString();
          saveState(state);
          notif(`${dev.name} ${dev.status}`, `${dev.status === 'active' || dev.status === 'on' || dev.status === 'recording' ? 'success' : 'warning'}`);
          return ok(dev);
        }
      }

      // ================= ROOMS =================
      if (url.startsWith('/rooms') && method === 'get') {
        return ok([...new Set(Object.values(state.devices).map(d => d.room))]);
      }

      // ================= SCENES =================
      if (url.startsWith('/scenes') && !url.includes('activate') && method === 'get') {
        return ok(Object.values(state.scenes));
      }

      if (url.startsWith('/scenes') && !url.includes('activate') && method === 'post') {
        const b = body();
        const id = 'scene_' + Date.now();
        state.scenes[id] = { id, name: b.name || 'New Scene', description: b.description || '', actions: b.actions || [] };
        saveState(state);
        notif(`Scene "${state.scenes[id].name}" created`, 'success');
        return ok(state.scenes[id]);
      }

      const sceneMatch = url.match(/\/scenes\/([^/?]+)/);
      if (sceneMatch && !url.includes('activate')) {
        const id = sceneMatch[1];
        const scene = state.scenes[id];
        if (!scene) return fail('Scene not found', 404);
        if (method === 'delete') {
          delete state.scenes[id];
          saveState(state);
          notif(`Scene "${scene.name}" deleted`, 'warning');
          return ok({ message: 'Scene deleted' });
        }
        if (method === 'put') {
          Object.assign(scene, body());
          saveState(state);
          return ok(scene);
        }
      }

      if (url.includes('/scenes/') && url.includes('/activate') && method === 'post') {
        const id = url.split('/scenes/')[1].split('/')[0];
        const scene = state.scenes[id];
        if (scene) {
          scene.actions.forEach(a => {
            const dev = state.devices[a.device_id];
            if (dev) {
              const target = a.action;
              dev.status =
                target === 'on' ? 'on' :
                target === 'off' ? 'off' :
                target === 'lock' ? 'locked' :
                target === 'unlock' ? 'unlocked' :
                target === 'record' ? 'recording' : dev.status;
              if (a.brightness) dev.brightness = a.brightness;
              if (a.temperature) dev.temperature = a.temperature;
            }
          });
          saveState(state);
          notif(`Scene "${scene.name}" activated`, 'success');
          return ok({ message: 'Scene activated successfully' });
        }
        return fail('Scene not found', 404);
      }

      // ================= AUTOMATIONS =================
      if (url.startsWith('/automations') && method === 'get') {
        return ok(Object.values(state.automations));
      }
      if (url.startsWith('/automations') && method === 'post') {
        const b = body();
        const rec = { id: 'auto_' + Date.now(), enabled: true, ...b };
        state.automations.push(rec);
        saveState(state);
        return ok(rec);
      }
      const autoMatch = url.match(/\/automations\/([^/?]+)/);
      if (autoMatch) {
        const id = autoMatch[1];
        const auto = state.automations.find(a => a.id === id);
        if (!auto) return fail('Automation not found', 404);
        if (method === 'delete') {
          state.automations = state.automations.filter(a => a.id !== id);
          saveState(state);
          return ok({ message: 'Deleted' });
        }
        if (method === 'put') {
          Object.assign(auto, body());
          saveState(state);
          return ok(auto);
        }
      }

      // ================= STATS =================
      if (url.startsWith('/stats') && method === 'get') {
        const total = Object.keys(state.devices).length;
        const active = Object.values(state.devices).filter(d => !['off', 'inactive', 'idle'].includes(d.status)).length;
        const roomsMap = {};
        Object.values(state.devices).forEach(d => {
          if (!roomsMap[d.room]) roomsMap[d.room] = { total: 0, active: 0 };
          roomsMap[d.room].total++;
          if (!['off', 'inactive', 'idle'].includes(d.status)) roomsMap[d.room].active++;
        });
        const todayEnergy = state.energyHistory[state.energyHistory.length - 1]?.energy || 45;
        return ok({
          total_devices: total,
          active_devices: active,
          rooms: roomsMap,
          today_energy: todayEnergy,
          total_energy: state.energyHistory.reduce((s, d) => s + d.energy, 0),
          notifications: state.notifications.length
        });
      }

      // ================= ENERGY / ANALYTICS =================
      if (url.startsWith('/energy') && method === 'get') {
        return ok(state.energyHistory);
      }

      // ================= NOTIFICATIONS =================
      if (url.startsWith('/notifications') && method === 'get') {
        return ok(state.notifications.slice(0, 30));
      }
      if (url.startsWith('/notifications') && method === 'delete') {
        state.notifications = [];
        saveState(state);
        return ok({ message: 'Cleared' });
      }

      return fail('Not found', 404);
    };

    return config;
  });
}
