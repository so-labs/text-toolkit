:: text-toolkit debug script (Space Indent Protection)
@echo off
 cd /d "%~dp0"
 title text-toolkit Debug Server
 echo ============================================================
 echo   text-toolkit Local Debug Server
 echo ============================================================
 echo.
 echo Starting a temporary HTTP server for local Puter.js debugging.
 echo (This avoids the file:/// protocol security restriction)
 echo.

:: Check for Python
 where python >nul 2>nul
 if %ERRORLEVEL% == 0 (
     echo [INFO] Python detected. Starting server at http://localhost:8000 ...
     echo.
     echo * Close this window to stop the debug server.
     echo.
     start http://localhost:8000
     python -m http.server 8000
     goto end
 )

:: Check for Node.js (npx)
 where npx >nul 2>nul
 if %ERRORLEVEL% == 0 (
     echo [INFO] Node.js (npx) detected. Starting server at http://localhost:3000 ...
     echo.
     echo * Close this window to stop the debug server.
     echo.
     start http://localhost:3000
     npx -y serve -l 3000
     goto end
 )

 echo.
 echo [ERROR] Neither Python nor Node.js (npm) is installed on your system.
 echo.
 echo Please install Python or Node.js to use the AI debug server.
 echo (All other text conversion features work fine by double-clicking index.html)
 echo.
 pause

:end
