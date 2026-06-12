@echo off
cd C:\Users\eamon_qw9m8iy\OneDrive\Desktop\jerseybasket
python install_v66.py
git add src/App.jsx
git commit -m "v66 update"
git push
echo.
echo Done! Check Vercel for build status.
pause
