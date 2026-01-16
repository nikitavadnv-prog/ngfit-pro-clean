#!/bin/bash

# Cleanup previous processes
echo "🧹 Cleaning up ports..."
lsof -ti:3000,3001 | xargs kill -9 2>/dev/null
pkill -f "localtunnel"

# Load .env variables (specifically for BOT_TOKEN)
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "🚀 Starting Tunnel (making local server public)..."
rm -f tunnel.log

# Use localtunnel as it is often more reliable for quick usage without keys
npx localtunnel --port 3000 > tunnel.log 2>&1 &
TUNNEL_PID=$!

echo "⏳ Waiting for public URL..."
max_attempts=30
attempt=1
TUNNEL_URL=""

while [ $attempt -le $max_attempts ]; do
    sleep 1
    # localtunnel outputs "your url is: https://..."
    TUNNEL_URL=$(grep -o "https://[a-zA-Z0-9.-]*\.loca\.lt" tunnel.log | head -n 1)
    
    if [ ! -z "$TUNNEL_URL" ]; then
        break
    fi
    echo -n "."
    attempt=$((attempt + 1))
done

if [ -z "$TUNNEL_URL" ]; then
    echo ""
    echo "❌ Failed to obtain tunnel URL. Trying fallback to localhost.run..."
    # Fallback to localhost.run if localtunnel fails
     ssh -R 80:localhost:3000 -o StrictHostKeyChecking=no nokey@localhost.run -- --no-inject-qr > tunnel.log 2>&1 &
     sleep 5
     TUNNEL_URL=$(grep -o "https://[a-zA-Z0-9.-]*\.lhr\.life" tunnel.log | head -n 1)
     if [ -z "$TUNNEL_URL" ]; then
        echo "❌ Both tunnel methods failed."
        cat tunnel.log
        exit 1
     fi
fi

echo ""
echo "✅ Public URL: $TUNNEL_URL"

# Export environment variables for the server
export VITE_APP_URL="$TUNNEL_URL"
# Ensure the server registers the webhook to this NEW url
export APP_URL="$TUNNEL_URL"

echo "📦 Running Migrations..."
npm run migrate > /dev/null 2>&1

echo "🟢 Starting Server..."
echo "The server will automatically register the Telegram Webhook to $TUNNEL_URL"
# Use exec to replace shell with the server process, but we want to keep tunnel running.
# So we run dev in background and wait.
npm run dev &
SERVER_PID=$!

# Trap ctrl-c to kill both
trap "kill $TUNNEL_PID $SERVER_PID; exit" SIGINT SIGTERM

wait $SERVER_PID
