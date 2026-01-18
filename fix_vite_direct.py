import pexpect
import sys

HOST = "178.209.127.28"
USER = "root"
PASS = "j*D-+ALrv59yby"

def run_remote_command(cmd, timeout=1200):
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
    
    # Wait for completion (EOF)
    # Print output while waiting? 
    # child.interact() would print to stdout but we want to capture or just wait.
    # We can read line by line.
    
    try:
        while True:
            line = child.readline()
            if not line: break
            print(line, end='')
    except pexpect.EOF:
        pass
    except pexpect.TIMEOUT:
        print("TIMEOUT executing command")
        return False
        
    child.close()
    return child.exitstatus == 0

print("--- Step 0: Stop App ---")
run_remote_command("pm2 stop all")

print("--- Step 1: Clean and Install ---")
run_remote_command("cd ngfit-pro-clean && rm -rf node_modules package-lock.json && npm install --include=dev --no-progress")

print("\n--- Step 2: Build App ---")
run_remote_command("cd ngfit-pro-clean && npm run build")

print("\n--- Step 3: Restart PM2 ---")
run_remote_command("pm2 reload all && pm2 save")

print("\n--- Done ---")
