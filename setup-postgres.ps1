# PostgreSQL Setup Script
Write-Host "🔍 Checking PostgreSQL installation..." -ForegroundColor Cyan

# Check if PostgreSQL is installed
$pgPath = "C:\Program Files\PostgreSQL\14\bin\psql.exe"
$pgPath15 = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
$pgPath16 = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

$psqlPath = $null
if (Test-Path $pgPath) { $psqlPath = $pgPath }
elseif (Test-Path $pgPath15) { $psqlPath = $pgPath15 }
elseif (Test-Path $pgPath16) { $psqlPath = $pgPath16 }

if ($psqlPath) {
    Write-Host "✅ PostgreSQL found at: $psqlPath" -ForegroundColor Green
    
    # Test connection
    Write-Host "`n🔌 Testing connection..." -ForegroundColor Cyan
    $env:PGPASSWORD = "postgres"
    & $psqlPath -U postgres -c "SELECT version();"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Connection successful!" -ForegroundColor Green
        
        # Create database
        Write-Host "`n📦 Creating delivery_db database..." -ForegroundColor Cyan
        $createdbPath = $psqlPath -replace "psql.exe", "createdb.exe"
        & $createdbPath -U postgres delivery_db 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database created successfully!" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  Database might already exist (this is OK)" -ForegroundColor Yellow
        }
        
        Write-Host "`n🎉 PostgreSQL is ready!" -ForegroundColor Green
        Write-Host "`nNext steps:" -ForegroundColor Cyan
        Write-Host "1. cd backend"
        Write-Host "2. npm run migrate"
        Write-Host "3. npm run seed"
        Write-Host "4. npm run dev"
        
    } else {
        Write-Host "❌ Connection failed. Check your password." -ForegroundColor Red
        Write-Host "Default password should be: postgres" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ PostgreSQL not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from:" -ForegroundColor Yellow
    Write-Host "https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
}
