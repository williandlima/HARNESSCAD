@echo off
REM HarnessCAD - servidor Java 8+ (sem bibliotecas)
REM 4o parametro opcional: quem pode excluir, ex.: "joao,maria,10.0.0.5"
cd /d "%~dp0server"
javac -encoding UTF-8 *.java
java -cp . HarnessServer 8080 "..\web" "..\dados" ""
pause
