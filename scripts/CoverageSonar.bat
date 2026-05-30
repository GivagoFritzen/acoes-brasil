@echo off
REM Script para gerar coverage e rodar analise SonarQube
REM Deve ser executado a partir da raiz do projeto
REM
REM Configuracao necessaria:
REM - O token deve estar em sonar-scanner.properties (sonar.login=seu_token)
REM - Para gerar token: http://localhost:9000 -> My Account -> Security -> Generate Token

setlocal EnableDelayedExpansion

set PROJECT_DIR=%~dp0..

if not exist "%PROJECT_DIR%\sonar-scanner.properties" (
    echo ========================================
    echo ERRO: Arquivo sonar-scanner.properties nao encontrado!
    echo ========================================
    pause
    exit /b 1
)

findstr /C:"sonar.login" "%PROJECT_DIR%\sonar-scanner.properties" >nul
if errorlevel 1 (
    echo ========================================
    echo ERRO: Token nao encontrado no arquivo sonar-scanner.properties!
    echo ========================================
    pause
    exit /b 1
)

echo Token encontrado no arquivo sonar-scanner.properties

echo ========================================
echo Gerando Coverage e analisando SonarQube
echo ========================================
echo.

echo [1/4] Rodando testes do backend com coverage...
cd /d "%PROJECT_DIR%\back"
call npm test -- --coverage

echo.
echo [2/4] Rodando testes do frontend com coverage...
cd /d "%PROJECT_DIR%\front"
call npm test -- --coverage

echo.
echo [3/4] Validando arquivos de coverage...
cd /d "%PROJECT_DIR%"
node scripts/ConvertCoverage.js
if errorlevel 1 (
    echo ========================================
    echo ERRO: Falha na validacao dos arquivos de coverage!
    echo ========================================
    pause
    exit /b 1
)

echo.
echo [4/4] Rodando analise SonarQube...

REM Extrai o token do sonar-scanner.properties
for /f "tokens=2 delims==" %%a in ('findstr /B "sonar.login" "%PROJECT_DIR%\sonar-scanner.properties"') do if not defined SONAR_TOKEN set "SONAR_TOKEN=%%a"

cd /d "%PROJECT_DIR%"
call npx sonar-scanner -Dsonar.login=%SONAR_TOKEN%

echo.
echo ========================================
echo Concluido! Verifique o SonarQube em:
echo http://localhost:9000/dashboard?id=acoes-local
echo ========================================
pause