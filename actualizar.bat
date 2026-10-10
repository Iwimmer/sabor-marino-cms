@echo off
chcp 65001 >nul
title Actualizar - CMS Sabor Marino
echo.
echo  ==============================================
echo     CMS SABOR MARINO - Actualizar
echo  ==============================================
echo  Usa este archivo despues de traer cambios nuevos del codigo
echo  (git pull o un ZIP nuevo). Vuelve a compilar la web y actualiza la base de datos.
echo.

echo  [1/5] Deteniendo el sistema si esta abierto...
taskkill /FI "WINDOWTITLE eq API Sabor Marino*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Web Sabor Marino*" /T /F >nul 2>&1
timeout /t 2 >nul

echo.
echo  [2/5] Revisando dependencias del backend...
cd /d "%~dp0backend"
call npm install --no-fund --no-audit
if errorlevel 1 goto error

echo.
echo  [3/5] Base de datos
echo     S = Reiniciar con los datos de demostracion (fotos, carrusel y textos nuevos).
echo         Se pierden los cambios que hiciste en el panel.
echo     N = Conservar tus datos y solo cambiar ilustraciones por fotos.
choice /C SN /M "     Reiniciar los datos de demostracion"
if errorlevel 2 (
  call npm run db:photos --silent
) else (
  call npm run db:reset --silent
)
if errorlevel 1 goto error

echo.
echo  [4/5] Revisando dependencias del frontend...
cd /d "%~dp0frontend"
call npm install --no-fund --no-audit
if errorlevel 1 goto error

echo.
echo  [5/5] Compilando la web (1 o 2 minutos)...
call npm run build
if errorlevel 1 goto error

echo.
echo  ==============================================
echo     Actualizacion completa. Iniciando el sistema...
echo  ==============================================
call "%~dp0iniciar.bat"
exit /b 0

:error
echo.
echo  [X] Ocurrio un error. Revisa el mensaje de arriba.
pause
exit /b 1
