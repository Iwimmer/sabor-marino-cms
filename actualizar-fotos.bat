@echo off
chcp 65001 >nul
title Actualizar fotos - CMS Sabor Marino
echo.
echo  Reemplazando ilustraciones por las fotos de backend\database\seed-images\photos ...
echo  (no hace falta apagar el sistema)
echo.
cd /d "%~dp0backend"
call npm run db:photos --silent
echo.
pause
