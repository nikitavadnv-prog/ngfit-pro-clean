import pexpect
import sys
import time

HOST = "178.209.127.28"
USER = "root"
PASS = "j*D-+ALrv59yby"
DOMAIN = "178.209.127.28.nip.io"
REPO = "https://github.com/nikitavadnv-prog/ngfit-pro-clean.git"

def run_command(child, cmd, timeout=300):
    print(f"Running: {cmd}")
    child.sendline(cmd)
    child.expect(r"[#$] ", timeout=timeout)
    print(child.before)

print(f"Connecting to {HOST}...")
child = pexpect.spawn(f"ssh {USER}@{HOST}", encoding='utf-8')

# Handle SSH key verification
i = child.expect(["password:", "continue connecting", pexpect.TIMEOUT], timeout=30)
if i == 1:
    child.sendline("yes")
    child.expect("password:")
elif i == 2:
    print("Timeout connecting")
    sys.exit(1)

child.sendline(PASS)
child.expect(r"[#$] ", timeout=30)
print("Connected!")

# Check directory
child.sendline("[ -d 'ngfit-pro-clean' ] && echo 'EXISTS' || echo 'MISSING'")
child.expect(r"[#$] ")
if "MISSING" in child.before and "EXISTS" not in child.before.split('\n')[-2:]: 
    # Logic to avoid false positive from command echo: check last lines
    # But simpler: if MISSING logic triggered
    pass

# We will just try to clone if it was missing or just run git pull if exists.
# Let's just try to cd.
child.sendline("cd ngfit-pro-clean")
child.expect(r"[#$] ")
if "No such file" in child.before:
    print("Repo missing. Cloning...")
    run_command(child, f"git clone {REPO}")
    child.sendline("cd ngfit-pro-clean")
    child.expect(r"[#$] ")
else:
    print("Repo exists. Pulling...")
    child.sendline("git pull")
    child.expect(r"[#$] ")

# Ensure we are on the 'Bot' branch with FORCE
print("Switching to Bot branch (Force)...")
child.sendline("git fetch origin")
child.expect(r"[#$] ")
child.sendline("git checkout -B Bot origin/Bot")
child.expect(r"[#$] ")
child.sendline("git reset --hard origin/Bot")
child.expect(r"[#$] ")

# Now we are in ~/ngfit-pro-clean or clone failed
run_command(child, "pwd") # Verify we are in the dir

# Back to root for install caddy? No, can run anywhere. By sudo? We are root.
# But caddy install needs cd /? No.

# Install Caddy
print("Installing Caddy...")
run_command(child, "caddy version || (curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg --yes && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list && apt update && apt install caddy -y)")

# Configure Caddy (using absolute path for file)
print("Configuring Caddy...")
caddyfile = f"""{DOMAIN} {{
    reverse_proxy localhost:3000
}}
"""
run_command(child, f"echo '{caddyfile}' > /etc/caddy/Caddyfile")
run_command(child, "systemctl reload caddy || systemctl start caddy")

# Setup App (.env in current dir which is ngfit-pro-clean)
print("Configuring App...")
env_content = f"""DATABASE_URL="file:sqlite.db"
TELEGRAM_BOT_TOKEN="8435304968:AAEe1nH8UmZ8leHBhnKl3EDhS4RRLGZY-Cc"
VITE_APP_URL="https://{DOMAIN}"
NODE_ENV="production"
PORT=3000
"""
run_command(child, f"echo '{env_content}' > .env")

# Build & Start
print("Building and Starting App...")
run_command(child, "npm install")
run_command(child, "npm run migrate")
run_command(child, "npm run build")
run_command(child, "pm2 stop all")
run_command(child, "pm2 delete all")
run_command(child, "pm2 start npm --name 'ngfit-bot' -- run start")
run_command(child, "pm2 save")
run_command(child, "pm2 startup") 

print(f"Deployment Complete! URL: https://{DOMAIN}")
child.sendline("exit")
