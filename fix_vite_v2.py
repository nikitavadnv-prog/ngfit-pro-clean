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
child.sendline() # Wake up prompt
child.expect(r"[#$] ", timeout=120)

child.sendline("cd ngfit-pro-clean")
child.expect(r"[#$] ")

print("--- Installing Vite manually ---")
run_command(child, "npm install -D vite esbuild --force --no-progress")

print("--- Verifying Vite ---")
run_command(child, "./node_modules/.bin/vite --version")
run_command(child, "./node_modules/.bin/esbuild --version")

print("--- Rebuilding ---")
run_command(child, "npm run build")

print("--- Restarting ---")
run_command(child, "pm2 reload all")
run_command(child, "pm2 save")

print("--- Done ---")
child.sendline("exit")
