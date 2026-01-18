import pexpect
import sys

HOST = "178.209.127.28"
USER = "root"
PASS = "j*D-+ALrv59yby"

def run_command(child, cmd, timeout=30):
    print(f"Running: {cmd}")
    child.sendline(cmd)
    child.expect(r"[#$] ", timeout=timeout)
    print(child.before)

child = pexpect.spawn(f"ssh {USER}@{HOST}", encoding='utf-8')
child.expect("password:", timeout=60)
child.sendline(PASS)
child.expect(r"[#$] ", timeout=60)

child.sendline("cd ngfit-pro-clean")
child.expect(r"[#$] ")

print("--- Checking Vite ---")
run_command(child, "ls -la node_modules/.bin/vite || echo 'Vite binary missing'")
run_command(child, "npm list vite")
run_command(child, "cat package.json | grep vite")
run_command(child, "./node_modules/.bin/vite --version || echo 'Cannot run vite directly'")

print("--- DEBUG PATH ---")
run_command(child, "echo $PATH")

child.sendline("exit")
