@echo off
REM Junta as partes sem precisar de Python (so comandos do Windows).
REM Aceita nome.p001.txt ou nome.p001. Com Python, usa o montar.py (mais completo).
setlocal
cd /d "%~dp0"
where python >nul 2>nul
if not errorlevel 1 if exist montar.py (
  python montar.py "%~dp0."
  goto fim
)
where py >nul 2>nul
if not errorlevel 1 if exist montar.py (
  py montar.py "%~dp0."
  goto fim
)
set achou=0
for %%f in (*.p001.txt) do (set achou=1& call :junta "%%~nf" ".txt")
for %%f in (*.p001) do (set achou=1& call :junta "%%~nxf" "")
if "%achou%"=="0" (
  echo Nenhuma parte .p001 encontrada nesta pasta. Arquivos aqui:
  dir /b
  goto fim
)
echo.
echo Confira o SHA-256 (1a linha do arquivo .sha256) com o calculado:
for %%f in (*.zip) do certutil -hashfile "%%f" SHA256
for %%f in (*.sha256*) do type "%%f"
echo.
echo Agora extraia o .zip: botao direito no arquivo ^> Extrair tudo...
goto fim

:junta
REM %1 = nome com .p001 (sem .txt), %2 = sufixo
set "dest=%~n1"
set "suf=%~2"
echo Montando %dest% ...
copy /y /b "%dest%.p001%suf%" "%dest%" >nul
set /a i=2
:prox
set "n=00%i%"
set "n=%n:~-3%"
if not exist "%dest%.p%n%%suf%" goto :eof
copy /y /b "%dest%"+"%dest%.p%n%%suf%" "%dest%" >nul
set /a i+=1
goto prox

:fim
pause
