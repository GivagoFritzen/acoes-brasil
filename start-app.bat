@echo off

echo Iniciando BACK...
start cmd /k "cd back && npm run dev"

echo Iniciando FRONT...
start cmd /k "cd front && ng serve"

echo Iniciando APP (Electron)...
start cmd /k "cd electron && npm run dev:electron"