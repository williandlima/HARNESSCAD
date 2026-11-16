@echo off
REM Abre o HarnessCAD sem servidor (modo local: salva/abre arquivos .json)
REM O jeito mais simples e o HarnessCAD.exe (ou o atalho criado pelo Instalar_HarnessCAD.exe).
if exist "%~dp0HarnessCAD.exe" (
  start "" "%~dp0HarnessCAD.exe"
  exit /b
)
if not exist "%~dp0web\js\imgpack\p001.js" (
  python "%~dp0ferramentas\embutir_imagens.py" 2>nul || py "%~dp0ferramentas\embutir_imagens.py" 2>nul || echo Sem Python: o PDF pode sair sem as imagens. Use o HarnessCAD.exe.
)
start "" "%~dp0web\index.html"
