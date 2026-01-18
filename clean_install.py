import pexpect
import sys

HOST = "178.209.127.28"
USER = "root"
PASS = "j*D-+ALrv59yby"

def run_command(child, cmd, timeout=1200):
    print(f"Running: {cmd}")
    child.sendline(cmd)
    child.expect(r"[#$] ", timeout=timeout)
    print(child.before)

child = pexpect.spawn(f"ssh {USER}@{HOST}", encoding='utf-8')
child.expect("password:")
child.sendline(PASS)
child.expect(r"[#$] ")

print("--- Clean Install ---")
# Go to dir
child.sendline("cd ngfit-pro-clean")
child.expect(r"[#$] ")

# Remove node_modules
print("Removing node_modules...")
run_command(child, "rm -rf node_modules package-lock.json")

# Install
print("Installing dependencies...")
run_command(child, "npm install --include=dev")

# Rebuild app
print("Building app...")
run_command(child, "npm run build")

# Restart PM2
print("Restarting PM2...")
run_command(child, "pm2 stop all")
run_command(child, "pm2 delete all")
run_command(child, "pm2 start npm --name 'ngfit-bot' -- run start")
run_command(child, "pm2 save")

print("--- Done ---")
child.sendline("exit")
