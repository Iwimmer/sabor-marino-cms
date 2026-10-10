@echo off
chcp 65001 >nul
title Instalador - CMS Sabor Marino
echo.
echo  ==============================================
echo     CMS SABOR MARINO - Instalador
echo  ==============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo  [X] No se encontro Node.js.
  echo      Descarga la version LTS desde https://nodejs.org e instala.
  echo      Luego vuelve a ejecutar este archivo.
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODEV=%%v
echo  [OK] Node.js %NODEV% encontrado
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=13)?0:1)"
if errorlevel 1 (
  echo  [X] Se necesita Node.js 22.13 o superior. Actualiza desde https://nodejs.org
  pause
  exit /b 1
)

echo.
echo  [1/5] Instalando dependencias del backend (API)...
cd /d "%~dp0backend"
call npm install --no-fund --no-audit
if errorlevel 1 goto error

echo.
echo  [2/5] Creando archivo de configuracion (.env)...
call npm run setup:env --silent
if errorlevel 1 goto error

echo.
echo  [3/5] Creando base de datos y datos de demostracion...
call npm run db:setup --silent
if errorlevel 1 goto error

echo.
echo  [4/5] Instalando dependencias del frontend (web y panel)...
cd /d "%~dp0frontend"
if not exist ".env.local" copy ".env.example" ".env.local" >nul
call npm install --no-fund --no-audit
if errorlevel 1 goto error

echo.
echo  [5/5] Compilando el frontend (puede tardar 1 o 2 minutos)...
call npm run build
if errorlevel 1 goto error

echo.
echo  ==============================================
echo     Instalacion completa
echo     Ejecuta iniciar.bat para levantar el sistema
echo  ==============================================
pause
exit /b 0

:error
echo.
echo  [X] Ocurrio un error. Revisa el mensaje de arriba.
pause
exit /b 1
