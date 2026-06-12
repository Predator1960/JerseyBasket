import subprocess, sys

APP_PATH = r'C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket\src\App.jsx'
REPO_PATH = r'C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket'

print("Reading App.jsx...")
with open(APP_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

if 'const MAINTENANCE = false;' not in content:
    print("ERROR: Could not find MAINTENANCE = false in App.jsx")
    print("App may already be in maintenance mode, or file has changed.")
    input("Press Enter to exit.")
    sys.exit(1)

content = content.replace('const MAINTENANCE = false;', 'const MAINTENANCE = true;')

print("Writing App.jsx...")
with open(APP_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("Deploying to Vercel...")
result = subprocess.run(
    'git add src/App.jsx && git commit -m "maintenance on" && git push',
    cwd=REPO_PATH,
    shell=True
)

if result.returncode == 0:
    print("")
    print("✅ DONE — Site is now showing 'Store Closed For Restocking'")
    print("   Run maintenance_off.py when you're ready to bring it back.")
else:
    print("❌ Git push failed — check that OneDrive is paused and try again.")

input("Press Enter to exit.")
