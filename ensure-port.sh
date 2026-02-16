#!/bin/bash
PORT=5173
PID=$(lsof -t -i:$PORT)
if [ -z "$PID" ]; then
  echo "Port $PORT is clear."
else
  echo "Killing process on port $PORT (PID: $PID)..."
  kill -9 $PID
fi
