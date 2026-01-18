import pexpect
import sys

HOST = "178.209.127.28"
USER = "root"
PASS = "j*D-+ALrv59yby"

def run_remote_command(cmd, timeout=30):
    print(f"Executing remote: {cmd}")
    child = pexpect.spawn(f"ssh {USER}@{HOST} \"{cmd}\"", encoding='utf-8')
    child.timeout = timeout
    i = child.expect(["password:", "continue connecting", pexpect.TIMEOUT], timeout=60)
    if i == 0:
        child.sendline(PASS)
    elif i == 1:
        child.sendline("yes")
        child.expect("password:")
        child.sendline(PASS)
    
    try:
        while True:
            line = child.readline()
            if not line: break
            print(line, end='')
    except pexpect.EOF:
        pass
    except pexpect.TIMEOUT:
        print("TIMEOUT executing command")
        
    child.close()

print("--- Checking Environment ---")
run_remote_command("printenv NODE_ENV")
run_remote_command("cd ngfit-pro-clean && npm config get production")

print("--- Listing Node Modules ---")
run_remote_command("ls ngfit-pro-clean/node_modules | grep vite")

print("--- Force Install Vite ---")
run_remote_command("cd ngfit-pro-clean && export NODE_ENV=development && npm install vite --save-dev --no-progress")

print("--- Verify Bin ---")
run_remote_command("ls -la ngfit-pro-clean/node_modules/.bin/vite")
