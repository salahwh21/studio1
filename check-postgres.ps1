# Script للتحقق من PostgreSQL

Write-Host "=== PostgreSQL Status Check ===" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL service exists
Write-Host "Checking PostgreSQL services..." -ForegroundColor Yellow
$services = Get-Service | Where-Object {$_.Name -like "*postgres*"}

if ($services) {
    Write-Host "✅ Found PostgreSQL services:" -ForegroundColor Green
    $services | Format-Table Name, Status, DisplayName -AutoSize
} else {
    Write-Host "❌ No PostgreSQL services found" -ForegroundColor Red
    Write-Host ""
    Write-Host "PostgreSQL is not installed or not configured as a service." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1. Install PostgreSQL from: https://www.postgresql.org/download/windows/"
    Write-Host "2. Use Docker: docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:14"
    Write-Host ""
}

# Check if port 5432 is in use
Write-Host ""
Write-Host "Checking port 5432..." -ForegroundColor Yellow
$port = netstat -ano | Select-String ":5432"

if ($port) {
    Write-Host "✅ Port 5432 is in use (PostgreSQL might be running)" -ForegroundColor Green
    Write-Host $port
} else {
    Write-Host "❌ Port 5432 is not in use (PostgreSQL is not running)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. If PostgreSQL is installed but stopped, start it from Services (services.msc)"
Write-Host "2. If not installed, follow BACKEND_SETUP.md"
Write-Host "3. After starting PostgreSQL, run: cd backend && npm run migrate"
Write-Host ""
