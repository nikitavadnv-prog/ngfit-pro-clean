import pexpect
import sys
import time

HOST = "178.209.127.28"
USER = "root"
PASS = "j*D-+ALrv59yby"
REPO = "https://github.com/nikitavadnv-prog/ngfit-pro-clean.git"

def run_command(child, cmd, timeout=300):
    print(f"Running: {cmd}")
    child.sendline(cmd)
    child.expect(r"[#$] ", timeout=timeout)
    print(child.before)

print("Connecting to server...")
child = pexpect.spawn(f"ssh {USER}@{HOST}", encoding='utf-8')

# Handle SSH key verification
i = child.expect(["password:", "continue connecting (yes/no)?"], timeout=30)
if i == 1:
    child.sendline("yes")
    child.expect("password:")
child.sendline(PASS)

# Wait for shell prompt
child.expect(r"[#$] ", timeout=30)
print("Connected!")

# 1. Update system and install dependencies
run_command(child, "apt-get update && apt-get install -y git curl unzip")

# 2. Install Node.js (via fnm or direct) - lets use direct Node 20
run_command(child, "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -")
run_command(child, "apt-get install -y nodejs")
run_command(child, "npm install -g pnpm pm2")

# 3. Clone or Pull Repo
# Check if directory exists
child.sendline("[ -d 'ngfit-pro-clean' ] && echo 'exists' || echo 'not found'")
child.expect(r"[#$] ")
if "exists" in child.before:
    print("Repo exists, pulling changes...")
    run_command(child, "cd ngfit-pro-clean && git pull")
else:
    print("Cloning repo...")
    run_command(child, "git clone " + REPO)
    run_command(child, "cd ngfit-pro-clean")

# 4. Install Dependencies & Build
run_command(child, "npm install")
# Run database migrations
run_command(child, "npm run migrate") 
# Build the project
run_command(child, "npm run build")

# 5. Create .env file if missing
# We will write the production env file directly
env_content = """DATABASE_URL="file:sqlite.db"
TELEGRAM_BOT_TOKEN="8435304968:AAEe1nH8UmZ8leHBhnKl3EDhS4RRLGZY-Cc"
VITE_APP_URL="https://178.209.127.28"
NODE_ENV="production"
PORT=80
"""
# Escape quotes for echo
env_cmd = f"echo '{env_content}' > .env"
run_command(child, env_cmd)

# 6. Start with PM2
# Stop existing if any
run_command(child, "pm2 stop all || true")
# Start
run_command(child, "pm2 start npm --name 'ngfit-bot' -- run start")
run_command(child, "pm2 save")
run_command(child, "pm2 startup")

print("Deployment Complete!")
child.sendline("exit")
