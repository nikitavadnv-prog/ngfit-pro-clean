#!/bin/bash
# Navigate to the project directory explicitly
cd /Users/nikita/ngfit-pro-clean || exit

echo "--- 1. Sending changes to Git ---"
git add .
git commit -m "Fix client navigation and profile lookup logic"
git push origin Bot

echo "--- 2. Updating TimeWeb Server ---"
# We use python unbuffered to see output immediately
python3 -u update_bot.py
