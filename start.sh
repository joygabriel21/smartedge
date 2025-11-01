#!/bin/bash

echo "Starting SmartEdge Streaming System..."

# Activate environment
source ~/.pyenv/versions/smartedge-streaming/bin/activate

# Start FastAPI
echo "Launching FastAPI..."
uvicorn api.main:app --host localhost --port 8000 &

# Start Faust
echo "Launching Faust..."
faust -A faust_app.app worker -l info &

# Start React
echo "Launching React..."
cd ../frontend && npm start
