# Smart Home Controller

A comprehensive smart home controller with Python backend, React frontend, CLI tool, and real-time device management.

## Features

- **Web Dashboard**: Beautiful React-based interface for managing all devices
- **Real-time Updates**: WebSocket integration for instant device status changes
- **Device Control**: Lights, thermostats, locks, cameras, and sensors
- **Room Management**: Organize devices by rooms
- **Scene Automation**: Pre-configured device combinations
- **CLI Tool**: Command-line interface for quick control
- **Authentication**: Secure JWT-based authentication

## Project Structure

```
smart-home-controller/
├── backend/                 # Python Flask backend
│   ├── app.py              # Main Flask application
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── App.js          # Main App component
│   └── package.json        # Node.js dependencies
├── cli/                    # Command-line interface
│   └── smart_home_cli.py   # CLI tool
└── README.md               # This file
```

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the server:
   ```bash
   python app.py
   ```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000`

### CLI Setup

1. Make the CLI executable:
   ```bash
   chmod +x cli/smart_home_cli.py
   ```

2. Create a symlink (optional):
   ```bash
   ln -s $(pwd)/cli/smart_home_cli.py /usr/local/bin/smart-home
   ```

## Usage

### Web Interface

1. Open `http://localhost:3000` in your browser
2. Login with credentials:
   - Username: `admin`
   - Password: `admin123`
3. Use the dashboard to control your devices

### CLI Usage

```bash
# Login
python cli/smart_home_cli.py login admin admin123

# List all devices
python cli/smart_home_cli.py devices

# List devices by room
python cli/smart_home_cli.py devices --room "Living Room"

# List devices by type
python cli/smart_home_cli.py devices --type light

# Toggle a device
python cli/smart_home_cli.py toggle light_1

# Set device property
python cli/smart_home_cli.py set light_1 brightness 50
python cli/smart_home_cli.py set thermostat_1 temperature 72

# List rooms
python cli/smart_home_cli.py rooms

# List scenes
python cli/smart_home_cli.py scenes

# Activate a scene
python cli/smart_home_cli.py activate scene_1

# Show statistics
python cli/smart_home_cli.py stats

# Show device status
python cli/smart_home_cli.py status light_1
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Login to get JWT token

#### Devices
- `GET /api/devices` - List all devices (optional query params: room, type)
- `GET /api/devices/:id` - Get specific device
- `PUT /api/devices/:id` - Update device
- `POST /api/devices/:id/toggle` - Toggle device

#### Rooms
- `GET /api/rooms` - List all rooms

#### Scenes
- `GET /api/scenes` - List all scenes
- `POST /api/scenes/:id/activate` - Activate a scene

#### Statistics
- `GET /api/stats` - Get home statistics

## Device Types

### Lights
- Control on/off state
- Adjust brightness (0-100%)
- Set color

### Thermostats
- Control on/off state
- Set temperature (60-85°F)
- View humidity
- Set mode (auto, heat, cool)

### Locks
- Lock/unlock doors
- View battery level

### Cameras
- Start/stop recording
- Toggle motion detection
- Toggle night vision

### Sensors
- Activate/deactivate
- Set sensitivity (low, medium, high)

## WebSocket Events

- `connect` - Client connected
- `disconnect` - Client disconnected
- `device_update` - Device status updated
- `device_command` - Send command to device

## Development

### Adding New Device Types

1. Add device definition to `devices` dictionary in `backend/app.py`
2. Create device card component in `frontend/src/components/`
3. Add device-specific controls in `DeviceCard.js`

### Adding New Scenes

1. Add scene definition to `get_scenes` endpoint in `backend/app.py`
2. Add scene actions to `activate_scene` endpoint

## License

MIT License
