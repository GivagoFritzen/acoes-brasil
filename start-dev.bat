@echo off

echo Iniciando BACK...
start cmd /k "cd back && npm run dev"

echo Iniciando FRONT...
start cmd /k "cd front && ng serve"