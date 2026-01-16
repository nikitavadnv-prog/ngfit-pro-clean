#!/bin/bash

# Kill any existing processes on ports 3001 (server) or 80 (tunnel match) just in case
# This helps avoid "Address already in use" errors if you restart
lsof -ti:3001 | xargs kill -9 2>/dev/null

echo "Starting NGFit Pro Server..."
# Start the server in the background
PORT=3001 npm run dev > server.log 2>&1 &
SERVER_PID=$!

echo "Waiting for server to initialize..."
sleep 5

echo "Starting Public Tunnel (localhost.run)..."
# Start the SSH tunnel in the background and log output
ssh -o StrictHostKeyChecking=no -R 80:localhost:3001 nokey@localhost.run > tunnel.log 2>&1 &
TUNNEL_PID=$!

echo "Waiting for tunnel to establish..."
sleep 5

# Extract the URL from the tunnel log
# Looking for pattern: https://something.lhr.life
TUNNEL_URL=$(grep -o "https://[a-zA-Z0-9.-]*\.lhr\.life" tunnel.log | head -n 1)

if [ -z "$TUNNEL_URL" ]; then
  echo "Error: Could not retrieve Tunnel URL. Check tunnel.log details."
  cat tunnel.log
  kill $SERVER_PID
  kill $TUNNEL_PID
  exit 1
fi

echo "Tunnel Live at: $TUNNEL_URL"
echo "Registering Telegram Webhook..."

# Register the new URL with Telegram
npm run telegram:webhook "$TUNNEL_URL"

echo "---------------------------------------------------"
echo "✅ BOT IS RUNNING!"
echo "You can close the AI agent, but KEEP THIS TERMINAL OPEN."
echo "Your App URL: $TUNNEL_URL"
echo "---------------------------------------------------"

# Wait for processes to finish (keep script running)
wait $SERVER_PID $TUNNEL_PID
