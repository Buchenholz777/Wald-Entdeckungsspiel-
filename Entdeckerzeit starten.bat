@echo off
rem Startet Entdeckerzeit lokal und öffnet die Seite im Standardbrowser.
rem Dieses Fenster muss offen bleiben, solange ihr die Seite benutzt. Beenden mit Strg+C.
cd /d "%~dp0"
if not exist dist\index.html (
  echo Die Seite wird zum ersten Mal gebaut ...
  call npm run build
)
start "" "http://127.0.0.1:4173"
call npm run preview
pause
