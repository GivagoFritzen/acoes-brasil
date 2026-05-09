@echo off
REM Script para gerar coverage e rodar analise SonarQube
REM Deve ser executado a partir da raiz do projeto

setlocal

set PROJECT_DIR=%~dp0..

echo ========================================
echo Gerando Coverage e analisando SonarQube
echo ========================================
echo.

echo [1/4] Rodando testes do backend com coverage...
cd /d "%PROJECT_DIR%\back"
call npm test

echo.
echo [2/4] Rodando testes do frontend com coverage...
cd /d "%PROJECT_DIR%\front"
call npm test -- --coverage

echo.
echo [3/4] Convertendo coverage do front para LCOV...
cd /d "%PROJECT_DIR%"
node scripts/convert-coverage.js

echo.
echo [4/4] Rodando analise SonarQube...
cd /d "%PROJECT_DIR%"
call npx sonar-scanner

echo.
echo ========================================
echo Concluido! Verifique o SonarQube em:
echo http://localhost:9000/dashboard?id=acoes-local
echo ========================================
pause