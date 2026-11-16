@echo off
REM Testes do servidor (Python) e abre os testes da interface no navegador
cd /d "%~dp0"
python -m unittest tests\test_server.py
start "" "%~dp0tests\testes.html"
pause
