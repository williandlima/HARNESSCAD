@echo off
REM HarnessCAD - servidor Python 3.8+ (somente biblioteca padrao)
REM Este arquivo fica na pasta HarnessCAD, junto das pastas server, web e dados.
REM Para restringir exclusao: --admins "joao,maria,10.0.0.5"
if not exist "%~dp0server\server.py" (
  echo ERRO: nao achei "%~dp0server\server.py".
  echo Este .bat precisa ficar na pasta HarnessCAD, junto das pastas server, web e dados.
  echo Se abriu de dentro do .zip, extraia o zip primeiro.
  pause
  exit /b 1
)
set PY=
where python >nul 2>nul && set PY=python
if not defined PY where py >nul 2>nul && set PY=py
if not defined PY if exist "C:\Python38\python.exe" set PY=C:\Python38\python.exe
if not defined PY if exist "%LOCALAPPDATA%\Programs\Python\Python38\python.exe" set PY="%LOCALAPPDATA%\Programs\Python\Python38\python.exe"
if not defined PY if exist "%LOCALAPPDATA%\Programs\Python\Python38-32\python.exe" set PY="%LOCALAPPDATA%\Programs\Python\Python38-32\python.exe"
if not defined PY (
  echo ERRO: Python nao encontrado. Instale o Python 3.8 ou edite a linha "set PY=" deste arquivo
  echo com o caminho do python.exe, ex.: set PY=C:\Python38\python.exe
  pause
  exit /b 1
)
cd /d "%~dp0server"
echo Abrindo http://localhost:8080/ ... (para parar: feche esta janela)
start "" http://localhost:8080/
%PY% server.py --port 8080 --data "..\dados"
echo.
echo O servidor parou. Se a mensagem acima fala em porta em uso (10048), outro programa usa a 8080:
echo troque 8080 por 8090 nas duas linhas deste arquivo.
pause
