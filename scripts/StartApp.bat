@echo off

echo Iniciando BACK...
start cmd /k "cd /d .. && cd back && npm run dev"

echo Iniciando FRONT...
start cmd /k "cd /d .. && cd front && ng serve"

echo Iniciando APP (Electron)...
start cmd /k "cd /d .. && cd electron && npm run dev:electron"