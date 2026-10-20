@echo off
setlocal
set "APP_PATH=%~dp0SonicRange_Studio_Portable.html"

where msedge >nul 2>nul
if %errorlevel%==0 (
    start "" msedge --app="file:///%APP_PATH:\=/%" --window-size=1460,920
    exit /b
)

where chrome >nul 2>nul
if %errorlevel%==0 (
    start "" chrome --app="file:///%APP_PATH:\=/%" --window-size=1460,920
    exit /b
)

start "" "%APP_PATH%"
