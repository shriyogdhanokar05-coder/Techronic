@echo off
cd /d "%~dp0"
set "PATH=C:\Users\shriy\nodejs\PFiles64\nodejs;%PATH%"
echo Building Techronics Cyber Tic-Tac-Toe Frontend...
call npm.cmd run build
