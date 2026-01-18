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

print("--- Checking Memory ---")
run_remote_command("free -h")

print("--- Adding Swap ---")
run_remote_command("fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048")
run_remote_command("chmod 600 /swapfile")
run_remote_command("mkswap /swapfile")
run_remote_command("swapon /swapfile")
run_remote_command("echo '/swapfile none swap sw 0 0' >> /etc/fstab")

print("--- Verify Swap ---")
run_remote_command("free -h")
