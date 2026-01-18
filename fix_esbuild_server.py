import pexpect
import sys

# Server details
HOST = "178.209.127.28"
USER = "root"
PASSWORD = "j*D-+ALrv59yby"
REMOTE_DIR = "~/ngfit-pro-clean"

def run_command(child, command, timeout=300):
    print(f"Executing: {command}")
    child.sendline(command)
    # Echo back command output
    child.expect(command) 
    # Wait for prompt
    child.expect(['#', '\$'], timeout=timeout)
    print(child.before)
    return child.before

def fix_esbuild():
    print("--- Connecting to Server ---")
    try:
        child = pexpect.spawn(f"ssh {USER}@{HOST}", encoding='utf-8', timeout=30)
        
        # Handle SSH login
        i = child.expect(['yes/no', 'password:', 'Password:', '#', '\$'])
        if i == 0:
            child.sendline('yes')
            child.expect(['password:', 'Password:'])
            child.sendline(PASSWORD)
        elif i == 1 or i == 2:
            child.sendline(PASSWORD)
        
        child.expect(['#', '\$'], timeout=60)
        
        # Go to directory
        run_command(child, f"cd {REMOTE_DIR}")
        
        # Check architecture
        print("--- Checking Architecture ---")
        run_command(child, "uname -m")
        
        # Reinstall esbuild
        print("--- Reinstalling Esbuild ---")
        run_command(child, "npm uninstall esbuild")
        # Install exact version to match package.json or latest compatible
        run_command(child, "npm install -D esbuild@^0.25.0", timeout=600)
        
        # Test build
        print("--- Testing Build ---")
        run_command(child, "npm run build", timeout=600)
        
        # Restart PM2
        print("--- Restarting PM2 ---")
        run_command(child, "pm2 reload all")
        
        print("--- Fix Complete! ---")
        child.close()
        
    except Exception as e:
        print(f"Error: {e}")
        if 'child' in locals() and child.isalive():
            print("Buffer before error:")
            print(child.before)
        sys.exit(1)

if __name__ == "__main__":
    fix_esbuild()
