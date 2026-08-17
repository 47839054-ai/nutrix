@echo off
echo ============================================
echo  Configuracion de Git - Nutrix
echo  Ejecutar una vez en cada equipo
echo ============================================
echo.

REM Cambia estas 3 lineas segun el alumno
set NOMBRE=Thomas Cuellar
set EMAIL=47839054@terciariourquiza.edu.ar
set DNI=47839054

echo Configurando git para: %NOMBRE% (%EMAIL%)
echo.

git config --global user.name "%NOMBRE%"
git config --global user.email "%EMAIL%"

echo Configuracion completada.
echo Verificando:
git config --global user.name
git config --global user.email
echo.
echo Ahora clona el repo:
echo   git clone https://github.com/47839054-ai/nutrix.git
echo.
pause
