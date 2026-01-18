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
child.expect("password:", timeout=60)
child.sendline(PASS)
child.expect(r"[#$] ", timeout=60)

# Kill stray npm processes from previous timeouts
child.sendline("pkill -9 -f npm || true")
child.expect(r"[#$] ", timeout=60)

print("--- Fixing Dependencies ---")
child.sendline("cd ngfit-pro-clean")
child.expect(r"[#$] ")

# Force install dev dependencies
print("Installing dev dependencies (vite, esbuild)...")
run_command(child, "npm install --include=dev")

# Check vite
print("Checking vite...")
run_command(child, "./node_modules/.bin/vite --version")

# Rebuild
print("Rebuilding...")
run_command(child, "npm run build")

# Restart
print("Restarting PM2...")
run_command(child, "pm2 reload all")
run_command(child, "pm2 save")

print("--- Done ---")
child.sendline("exit")
