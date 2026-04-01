# Stop any existing servers
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "ng" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "--- PowerLink Performance Boost ---" -ForegroundColor Green
Write-Host "Step 1: Running Production Build..." -ForegroundColor Cyan
npm run build

Write-Host "Step 2: Starting Backend..." -ForegroundColor Cyan
Start-Process node -ArgumentList "backend/server.js" -WindowStyle Hidden

Write-Host "Step 3: Serving Optimized Production App..." -ForegroundColor Cyan
# Install http-server if not present and serve with compression
npx -y http-server dist/power-link -p 8080 -g --cors

Write-Host "READY: Run Lighthouse against http://localhost:8080" -ForegroundColor Green
