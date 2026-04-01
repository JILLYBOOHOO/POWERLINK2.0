param(
  [string]$ApiPort = "3001",
  [string]$WebPort = "4200"
)

$projectRoot = Split-Path -Parent $PSScriptRoot

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$projectRoot'; `$env:PORT='$ApiPort'; npm run start:api"
)

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$projectRoot'; npm start -- --host 127.0.0.1 --port $WebPort"
)
