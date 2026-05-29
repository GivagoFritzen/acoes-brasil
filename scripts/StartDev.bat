@echo off

echo Iniciando BACK...
start cmd /k "cd .. && cd back && npm run dev"

echo Iniciando FRONT...
start cmd /k "cd .. && cd front && ng serve"