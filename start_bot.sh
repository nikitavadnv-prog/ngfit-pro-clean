#!/bin/bash

# Kill any existing processes on ports 3001 (server) or 80 (tunnel match) just in case
# This helps avoid "Address already in use" errors if you restart
lsof -ti:3001 | xargs kill -9 2>/dev/null

echo "Starting NGFit Pro Server..."
# Start the server in the background
npm run dev > server.log 2>&1 &
SERVER_PID=$!

echo "Waiting for server to initialize..."
sleep 5

echo "Using public URL from .env (BotHost)"
# Load VITE_APP_URL from environment (already loaded via dotenv in scripts)
APP_URL=${VITE_APP_URL}
if [ -z "$APP_URL" ]; then
  echo "Error: VITE_APP_URL is not set in .env"
  kill $SERVER_PID
  exit 1
fi

echo "App URL: $APP_URL"

echo "Registering Telegram Webhook..."
# Register the URL with Telegram using the npm script
npm run telegram:webhook "$APP_URL"

echo "---------------------------------------------------"
echo "✅ BOT IS RUNNING!"
echo "You can close the AI agent, but KEEP THIS TERMINAL OPEN."
echo "Your App URL: $APP_URL"
echo "---------------------------------------------------"

# Wait for processes to finish (keep script running)
wait $SERVER_PID $TUNNEL_PID
