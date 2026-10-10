@echo off
chcp 65001 >nul
title CMS Sabor Marino
echo.
echo  Iniciando CMS Sabor Marino...
echo   - API (Express):      http://localhost:4000/api
echo   - Web y panel (Next): http://localhost:3000
echo.
start "API Sabor Marino" cmd /k "cd /d "%~dp0backend" && npm start"
timeout /t 3 >nul
start "Web Sabor Marino" cmd /k "cd /d "%~dp0frontend" && npm start"
timeout /t 6 >nul
start http://localhost:3000
timeout /t 1 >nul
start http://localhost:3000/admin
echo  Listo. Para detener el sistema cierra las ventanas "API Sabor Marino" y "Web Sabor Marino".
echo.
echo  Usuarios de prueba:
echo    ADMIN  admin@sabormarino.pe  / Admin123*
echo    EDITOR editor@sabormarino.pe / Editor123*
timeout /t 10 >nul
