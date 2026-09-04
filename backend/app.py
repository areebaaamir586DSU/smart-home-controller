import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'smart-home-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

CORS(app, resources={r"/api/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
jwt = JWTManager(app)

# Simulated devices database
devices = {
    "light_1": {
        "id": "light_1",
        "name": "Living Room Light",
        "type": "light",
        "room": "Living Room",
        "status": "on",
        "brightness": 80,
        "color": "#FFFFFF"
    },
    "light_2": {
        "id": "light_2",
        "name": "Bedroom Light",
        "type": "light",
        "room": "Bedroom",
        "status": "off",
        "brightness": 50,
        "color": "#FFD700"
    },
    "thermostat_1": {
        "id": "thermostat_1",
        "name": "Main Thermostat",
        "type": "thermostat",
        "room": "Living Room",
        "status": "on",
        "temperature": 72,
        "mode": "auto",
        "humidity": 45
    },
    "lock_1": {
        "id": "lock_1",
        "name": "Front Door Lock",
        "type": "lock",
        "room": "Entrance",
        "status": "locked",
        "battery": 85
    },
    "camera_1": {
        "id": "camera_1",
        "name": "Front Door Camera",
        "type": "camera",
        "room": "Entrance",
        "status": "recording",
        "motion_detection": True,
        "night_vision": True
    },
    "sensor_1": {
        "id": "sensor_1",
        "name": "Motion Sensor",
        "type": "sensor",
        "room": "Hallway",
        "status": "active",
        "last_triggered": None,
        "sensitivity": "medium"
    }
}

users_db = {
    "admin": {
        "username": "admin",
        "password": "admin123",
        "role": "admin"
    }
}

# Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = users_db.get(username)
    if user and user['password'] == password:
        access_token = create_access_token(identity=username)
        return jsonify({
            'access_token': access_token,
            'user': {
                'username': username,
                'role': user['role']
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/devices', methods=['GET'])
@jwt_required()
def get_devices():
    room = request.args.get('room')
    device_type = request.args.get('type')
    
    filtered_devices = list(devices.values())
    
    if room:
        filtered_devices = [d for d in filtered_devices if d['room'] == room]
    if device_type:
        filtered_devices = [d for d in filtered_devices if d['type'] == device_type]
    
    return jsonify(filtered_devices)

@app.route('/api/devices/<device_id>', methods=['GET'])
@jwt_required()
def get_device(device_id):
    device = devices.get(device_id)
    if not device:
        return jsonify({'error': 'Device not found'}), 404
    return jsonify(device)

@app.route('/api/devices/<device_id>', methods=['PUT'])
@jwt_required()
def update_device(device_id):
    device = devices.get(device_id)
    if not device:
        return jsonify({'error': 'Device not found'}), 404
    
    data = request.get_json()
    devices[device_id].update(data)
    
    socketio.emit('device_update', devices[device_id])
    
    return jsonify(devices[device_id])

@app.route('/api/devices/<device_id>/toggle', methods=['POST'])
@jwt_required()
def toggle_device(device_id):
    device = devices.get(device_id)
    if not device:
        return jsonify({'error': 'Device not found'}), 404
    
    if device['type'] == 'light':
        device['status'] = 'off' if device['status'] == 'on' else 'on'
    elif device['type'] == 'lock':
        device['status'] = 'unlocked' if device['status'] == 'locked' else 'locked'
    elif device['type'] == 'thermostat':
        device['status'] = 'off' if device['status'] == 'on' else 'on'
    elif device['type'] == 'camera':
        device['status'] = 'idle' if device['status'] == 'recording' else 'recording'
    elif device['type'] == 'sensor':
        device['status'] = 'inactive' if device['status'] == 'active' else 'active'
    
    socketio.emit('device_update', device)
    
    return jsonify(device)

@app.route('/api/rooms', methods=['GET'])
@jwt_required()
def get_rooms():
    rooms = list(set(device['room'] for device in devices.values()))
    return jsonify(rooms)

@app.route('/api/scenes', methods=['GET'])
@jwt_required()
def get_scenes():
    scenes = [
        {
            "id": "scene_1",
            "name": "Good Morning",
            "description": "Turn on lights and adjust thermostat",
            "actions": [
                {"device_id": "light_1", "action": "on", "brightness": 100},
                {"device_id": "thermostat_1", "action": "on", "temperature": 72}
            ]
        },
        {
            "id": "scene_2",
            "name": "Good Night",
            "description": "Turn off lights and lock doors",
            "actions": [
                {"device_id": "light_1", "action": "off"},
                {"device_id": "light_2", "action": "off"},
                {"device_id": "lock_1", "action": "lock"}
            ]
        },
        {
            "id": "scene_3",
            "name": "Away Mode",
            "description": "Security mode when leaving home",
            "actions": [
                {"device_id": "light_1", "action": "off"},
                {"device_id": "lock_1", "action": "lock"},
                {"device_id": "camera_1", "action": "record"}
            ]
        }
    ]
    return jsonify(scenes)

@app.route('/api/scenes/<scene_id>/activate', methods=['POST'])
@jwt_required()
def activate_scene(scene_id):
    scenes = {
        "scene_1": [
            {"device_id": "light_1", "status": "on", "brightness": 100},
            {"device_id": "thermostat_1", "status": "on", "temperature": 72}
        ],
        "scene_2": [
            {"device_id": "light_1", "status": "off"},
            {"device_id": "light_2", "status": "off"},
            {"device_id": "lock_1", "status": "locked"}
        ],
        "scene_3": [
            {"device_id": "light_1", "status": "off"},
            {"device_id": "lock_1", "status": "locked"},
            {"device_id": "camera_1", "status": "recording"}
        ]
    }
    
    if scene_id not in scenes:
        return jsonify({'error': 'Scene not found'}), 404
    
    for action in scenes[scene_id]:
        device_id = action['device_id']
        if device_id in devices:
            devices[device_id].update(action)
            socketio.emit('device_update', devices[device_id])
    
    return jsonify({'message': 'Scene activated successfully'})

@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_stats():
    total_devices = len(devices)
    active_devices = sum(1 for d in devices.values() if d['status'] not in ['off', 'inactive', 'idle'])
    
    rooms = {}
    for device in devices.values():
        room = device['room']
        if room not in rooms:
            rooms[room] = {'total': 0, 'active': 0}
        rooms[room]['total'] += 1
        if device['status'] not in ['off', 'inactive', 'idle']:
            rooms[room]['active'] += 1
    
    return jsonify({
        'total_devices': total_devices,
        'active_devices': active_devices,
        'rooms': rooms
    })

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connected', {'message': 'Connected to Smart Home Controller'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('device_command')
def handle_device_command(data):
    device_id = data.get('device_id')
    command = data.get('command')
    
    if device_id in devices:
        device = devices[device_id]
        
        if command == 'toggle':
            if device['type'] == 'light':
                device['status'] = 'off' if device['status'] == 'on' elif device['status'] == 'on' else 'off'
            socketio.emit('device_update', device)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
