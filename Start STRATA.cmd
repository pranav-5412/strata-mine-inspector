@echo off
cd /d "%~dp0"
if not exist "dist\index.html" (
  echo STRATA needs its first build. Run npm install and npm run build in this folder.
  pause
  exit /b 1
)
start "" "http://127.0.0.1:4173"
call npm.cmd run preview -- --port 4173 --strictPort
