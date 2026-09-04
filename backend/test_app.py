import pytest
import json
from app import app, devices

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def get_auth_token(client):
    """Helper to get authentication token"""
    response = client.post('/api/auth/login', 
                          json={'username': 'admin', 'password': 'admin123'})
    return json.loads(response.data)['access_token']

def test_login(client):
    """Test login endpoint"""
    response = client.post('/api/auth/login', 
                          json={'username': 'admin', 'password': 'admin123'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data
    assert data['user']['username'] == 'admin'

def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    response = client.post('/api/auth/login', 
                          json={'username': 'admin', 'password': 'wrongpassword'})
    assert response.status_code == 401

def test_get_devices(client):
    """Test get devices endpoint"""
    token = get_auth_token(client)
    response = client.get('/api/devices', 
                         headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) > 0

def test_get_devices_by_type(client):
    """Test get devices filtered by type"""
    token = get_auth_token(client)
    response = client.get('/api/devices?type=light', 
                         headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert all(device['type'] == 'light' for device in data)

def test_get_device(client):
    """Test get specific device"""
    token = get_auth_token(client)
    response = client.get('/api/devices/light_1', 
                         headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['id'] == 'light_1'

def test_update_device(client):
    """Test update device"""
    token = get_auth_token(client)
    response = client.put('/api/devices/light_1', 
                         json={'brightness': 50},
                         headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['brightness'] == 50

def test_toggle_device(client):
    """Test toggle device"""
    token = get_auth_token(client)
    original_status = devices['light_1']['status']
    response = client.post('/api/devices/light_1/toggle', 
                          headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] != original_status

def test_get_rooms(client):
    """Test get rooms endpoint"""
    token = get_auth_token(client)
    response = client.get('/api/rooms', 
                         headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) > 0

def test_get_scenes(client):
    """Test get scenes endpoint"""
    token = get_auth_token(client)
    response = client.get('/api/scenes', 
                         headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) > 0

def test_get_stats(client):
    """Test get stats endpoint"""
    token = get_auth_token(client)
    response = client.get('/api/stats', 
                         headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'total_devices' in data
    assert 'active_devices' in data

def test_unauthorized_access(client):
    """Test unauthorized access"""
    response = client.get('/api/devices')
    assert response.status_code == 401
