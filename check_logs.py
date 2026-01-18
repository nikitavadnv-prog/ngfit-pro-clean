import pexpect
import sys

HOST = "178.209.127.28"
USER = "root"
PASS = "j*D-+ALrv59yby"

child = pexpect.spawn(f"ssh {USER}@{HOST}", encoding='utf-8')
child.expect("password:")
child.sendline(PASS)
child.expect(r"[#$] ")

print("--- Package JSON Scripts ---")
child.sendline("cat ngfit-pro-clean/package.json")
child.expect(r"[#$] ")
print(child.before)

print("\n--- PM2 Logs ---")
child.sendline("pm2 logs ngfit-bot --lines 50 --nostream")
child.expect(r"[#$] ")
print(child.before)

child.sendline("exit")
