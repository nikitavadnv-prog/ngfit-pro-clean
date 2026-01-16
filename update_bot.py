import pexpect
import sys
import os

# Server details
HOST = "178.209.127.28"
USER = "root"
PASSWORD = "j*D-+ALrv59yby"  
REMOTE_DIR = "~/ngfit-pro-clean"

def run_command(child, command, timeout=300):
    print(f"Executing: {command}")
    child.sendline(command)
    # Echo back command output
    child.expect(command) 
    # Wait for prompt
    child.expect(['#', '\$'], timeout=timeout)
    print(child.before)
    return child.before

import time

def update_on_server():
    print("--- Connecting to Server ---")
    try:
        child = pexpect.spawn(f"ssh {USER}@{HOST}", encoding='utf-8', timeout=30)
        
        # Handle SSH login
        i = child.expect(['yes/no', 'password:', 'Password:', '#', '\$'])
        if i == 0:
            child.sendline('yes')
            child.expect(['password:', 'Password:'])
            time.sleep(1)
            child.sendline(PASSWORD)
        elif i == 1 or i == 2:
            time.sleep(1) # Wait a bit for buffer to be ready
            child.sendline(PASSWORD)
        
        # Expect prompt
        child.expect(['#', '\$'], timeout=60)
        
        # Go to directory
        run_command(child, f"cd {REMOTE_DIR}")
        
        # 1. Fix Git & Pull
        print("--- 1. Syncing Code (Fetch & Reset) ---")
        run_command(child, "git fetch origin")
        run_command(child, "git reset --hard origin/Bot")
        
        # 2. Install Dependencies
        print("--- 2. Installing Dependencies ---")
        # Ensure we have dev dependencies for build and db push
        run_command(child, "npm install --include=dev --no-progress", timeout=1200)
        
        # 3. Update Database Schema
        print("--- 3. Updating Database Schema ---")
        # This will run drizzle-kit generate && drizzle-kit migrate
        # Ensure DATABASE_URL is set in .env (it should be)
        run_command(child, "npm run db:push", timeout=300)

        # 4. Build
        print("--- 4. Rebuilding App ---")
        run_command(child, "npm run build", timeout=600)
        
        # 5. Restart PM2
        print("--- 5. Restarting Bot ---")
        run_command(child, "pm2 reload all")
        run_command(child, "pm2 save")

        print("--- Update Complete! ---")
        
        child.close()
        
    except Exception as e:
        print(f"Error: {e}")
        # Print helpful debug info if possible
        if 'child' in locals() and child.isalive():
            print("Buffer before error:")
            print(child.before)
        sys.exit(1)

if __name__ == "__main__":
    update_on_server()
