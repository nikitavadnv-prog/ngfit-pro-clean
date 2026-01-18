import pexpect
import sys

HOST = "178.209.127.28"
USER = "root"
PASS = "j*D-+ALrv59yby"

child = pexpect.spawn(f"ssh {USER}@{HOST}", encoding='utf-8')
child.expect("password:")
child.sendline(PASS)
child.expect(r"[#$] ")

print("--- Checking Architecture ---")
child.sendline("uname -m")
child.expect(r"[#$] ")
print(child.before)

print("--- Reinstalling esbuild ---")
child.sendline("cd ngfit-pro-clean && npm rebuild esbuild || npm install esbuild --force")
child.expect(r"[#$] ", timeout=120)
print(child.before)

print("--- Restarting PM2 ---")
child.sendline("pm2 stop all")
child.sendline("pm2 delete all")
child.sendline("pm2 start npm --name 'ngfit-bot' -- run start")
child.expect(r"[#$] ")

print("--- Done ---")
child.sendline("exit")
