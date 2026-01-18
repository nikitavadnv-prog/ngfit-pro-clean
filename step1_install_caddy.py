import pexpect
import sys

HOST = "178.209.127.28"
USER = "root"
PASS = "j*D-+ALrv59yby"

print("--- Step 1: Connecting to Server ---")
child = pexpect.spawn(f"ssh {USER}@{HOST}", encoding='utf-8')
child.logfile = sys.stdout # Stream output to visible log

i = child.expect(["password:", "continue connecting", pexpect.TIMEOUT], timeout=10)
if i == 1:
    child.sendline("yes")
    child.expect("password:")
elif i == 2:
    print("Timeout waiting for SSH login prompt")
    sys.exit(1)

child.sendline(PASS)
child.expect(r"[#$] ", timeout=10)
print("\n>>> Connected successfully!")

print("\n--- Step 2: Installing Caddy (SSL Server) ---")
cmds = [
    "apt install -y debian-keyring debian-archive-keyring apt-transport-https curl",
    "curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg --yes",
    "curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list",
    "apt update",
    "apt install caddy -y"
]

for cmd in cmds:
    print(f"\nRunning: {cmd}")
    child.sendline(cmd)
    # Wait for prompt, long timeout for installs
    child.expect(r"[#$] ", timeout=120)

print("\n>>> Caddy Installed.")
child.sendline("exit")
