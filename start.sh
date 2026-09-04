#!/bin/bash

# Smart Home Controller Startup Script

echo "========================================="
echo "    Smart Home Controller Startup"
echo "========================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is required but not installed."
    exit 1
fi

echo ""
echo "Starting Smart Home Controller..."
echo ""

# Start backend
echo "Starting backend server..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt -q

# Start backend server in background
echo "Starting Flask server on port 5000..."
python app.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

cd ..

# Start frontend
echo ""
echo "Starting frontend server..."
cd frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install --silent

# Start frontend server
echo "Starting React development server on port 3000..."
npm start &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "    Smart Home Controller Started!"
echo "========================================="
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Default credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
