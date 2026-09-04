#!/usr/bin/env python3
"""
Smart Home Controller CLI Tool
Command-line interface for controlling smart home devices
"""

import argparse
import json
import requests
import sys
from typing import Optional

class SmartHomeCLI:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.token = None
        self.session = requests.Session()
    
    def login(self, username: str, password: str) -> bool:
        """Login to the smart home controller"""
        try:
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json={"username": username, "password": password}
            )
            if response.status_code == 200:
                data = response.json()
                self.token = data["access_token"]
                self.session.headers.update({
                    "Authorization": f"Bearer {self.token}"
                })
                print(f"✓ Logged in as {username}")
                return True
            else:
                print(f"✗ Login failed: {response.json().get('error', 'Unknown error')}")
                return False
        except requests.exceptions.ConnectionError:
            print("✗ Could not connect to smart home controller")
            return False
    
    def get_devices(self, room: Optional[str] = None, device_type: Optional[str] = None) -> list:
        """Get all devices or filter by room/type"""
        params = {}
        if room:
            params["room"] = room
        if device_type:
            params["type"] = device_type
        
        response = self.session.get(f"{self.base_url}/api/devices", params=params)
        if response.status_code == 200:
            return response.json()
        return []
    
    def get_device(self, device_id: str) -> Optional[dict]:
        """Get a specific device"""
        response = self.session.get(f"{self.base_url}/api/devices/{device_id}")
        if response.status_code == 200:
            return response.json()
        return None
    
    def toggle_device(self, device_id: str) -> bool:
        """Toggle a device on/off"""
        response = self.session.post(f"{self.base_url}/api/devices/{device_id}/toggle")
        if response.status_code == 200:
            device = response.json()
            print(f"✓ {device['name']} is now {device['status']}")
            return True
        else:
            print(f"✗ Failed to toggle device {device_id}")
            return False
    
    def update_device(self, device_id: str, updates: dict) -> bool:
        """Update device properties"""
        response = self.session.put(
            f"{self.base_url}/api/devices/{device_id}",
            json=updates
        )
        if response.status_code == 200:
            device = response.json()
            print(f"✓ Updated {device['name']}")
            return True
        else:
            print(f"✗ Failed to update device {device_id}")
            return False
    
    def get_rooms(self) -> list:
        """Get all rooms"""
        response = self.session.get(f"{self.base_url}/api/rooms")
        if response.status_code == 200:
            return response.json()
        return []
    
    def get_scenes(self) -> list:
        """Get all scenes"""
        response = self.session.get(f"{self.base_url}/api/scenes")
        if response.status_code == 200:
            return response.json()
        return []
    
    def activate_scene(self, scene_id: str) -> bool:
        """Activate a scene"""
        response = self.session.post(f"{self.base_url}/api/scenes/{scene_id}/activate")
        if response.status_code == 200:
            print(f"✓ Scene activated successfully")
            return True
        else:
            print(f"✗ Failed to activate scene {scene_id}")
            return False
    
    def get_stats(self) -> dict:
        """Get home statistics"""
        response = self.session.get(f"{self.base_url}/api/stats")
        if response.status_code == 200:
            return response.json()
        return {}

def main():
    parser = argparse.ArgumentParser(description="Smart Home Controller CLI")
    parser.add_argument("--url", default="http://localhost:5000", help="Smart home controller URL")
    
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Login command
    login_parser = subparsers.add_parser("login", help="Login to the controller")
    login_parser.add_argument("username", help="Username")
    login_parser.add_argument("password", help="Password")
    
    # Devices command
    devices_parser = subparsers.add_parser("devices", help="List devices")
    devices_parser.add_argument("--room", help="Filter by room")
    devices_parser.add_argument("--type", help="Filter by type (light, thermostat, lock, camera, sensor)")
    
    # Toggle command
    toggle_parser = subparsers.add_parser("toggle", help="Toggle a device")
    toggle_parser.add_argument("device_id", help="Device ID to toggle")
    
    # Set command
    set_parser = subparsers.add_parser("set", help="Set device property")
    set_parser.add_argument("device_id", help="Device ID")
    set_parser.add_argument("property", help="Property to set (e.g., brightness, temperature)")
    set_parser.add_argument("value", help="Value to set")
    
    # Rooms command
    subparsers.add_parser("rooms", help="List rooms")
    
    # Scenes command
    subparsers.add_parser("scenes", help="List scenes")
    
    # Activate scene command
    activate_parser = subparsers.add_parser("activate", help="Activate a scene")
    activate_parser.add_argument("scene_id", help="Scene ID to activate")
    
    # Stats command
    subparsers.add_parser("stats", help="Show home statistics")
    
    # Status command
    status_parser = subparsers.add_parser("status", help="Show device status")
    status_parser.add_argument("device_id", help="Device ID")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    cli = SmartHomeCLI(args.url)
    
    # Login first
    if args.command == "login":
        cli.login(args.username, args.password)
        return
    
    # Check if logged in
    if not cli.token:
        print("Please login first: smart-home login <username> <password>")
        return
    
    if args.command == "devices":
        devices = cli.get_devices(args.room, args.type)
        if devices:
            print(f"\nFound {len(devices)} device(s):\n")
            for device in devices:
                status = device['status']
                print(f"  {device['id']:15} {device['name']:25} {device['type']:12} {device['room']:15} {status}")
        else:
            print("No devices found")
    
    elif args.command == "toggle":
        cli.toggle_device(args.device_id)
    
    elif args.command == "set":
        try:
            value = int(args.value)
        except ValueError:
            try:
                value = float(args.value)
            except ValueError:
                value = args.value
        
        cli.update_device(args.device_id, {args.property: value})
    
    elif args.command == "rooms":
        rooms = cli.get_rooms()
        if rooms:
            print(f"\nRooms ({len(rooms)}):\n")
            for room in rooms:
                print(f"  • {room}")
        else:
            print("No rooms found")
    
    elif args.command == "scenes":
        scenes = cli.get_scenes()
        if scenes:
            print(f"\nScenes ({len(scenes)}):\n")
            for scene in scenes:
                print(f"  {scene['id']:15} {scene['name']:25} {scene['description']}")
        else:
            print("No scenes found")
    
    elif args.command == "activate":
        cli.activate_scene(args.scene_id)
    
    elif args.command == "stats":
        stats = cli.get_stats()
        if stats:
            print(f"\nHome Statistics:")
            print(f"  Total Devices: {stats.get('total_devices', 0)}")
            print(f"  Active Devices: {stats.get('active_devices', 0)}")
            print(f"  Rooms: {len(stats.get('rooms', {}))}")
            
            if stats.get('rooms'):
                print(f"\n  Rooms Breakdown:")
                for room, data in stats['rooms'].items():
                    print(f"    {room}: {data['active']}/{data['total']} active")
        else:
            print("Could not fetch statistics")
    
    elif args.command == "status":
        device = cli.get_device(args.device_id)
        if device:
            print(f"\nDevice Status:")
            print(f"  ID: {device['id']}")
            print(f"  Name: {device['name']}")
            print(f"  Type: {device['type']}")
            print(f"  Room: {device['room']}")
            print(f"  Status: {device['status']}")
            
            if device['type'] == 'light':
                print(f"  Brightness: {device.get('brightness', 'N/A')}%")
                print(f"  Color: {device.get('color', 'N/A')}")
            elif device['type'] == 'thermostat':
                print(f"  Temperature: {device.get('temperature', 'N/A')}°F")
                print(f"  Humidity: {device.get('humidity', 'N/A')}%")
                print(f"  Mode: {device.get('mode', 'N/A')}")
            elif device['type'] == 'lock':
                print(f"  Battery: {device.get('battery', 'N/A')}%")
            elif device['type'] == 'camera':
                print(f"  Motion Detection: {device.get('motion_detection', 'N/A')}")
                print(f"  Night Vision: {device.get('night_vision', 'N/A')}")
            elif device['type'] == 'sensor':
                print(f"  Sensitivity: {device.get('sensitivity', 'N/A')}")
        else:
            print(f"Device {args.device_id} not found")

if __name__ == "__main__":
    main()
