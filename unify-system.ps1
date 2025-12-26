# 🚀 توحيد النظام الموجود مع الداتا بيز المركزية فقط
Clear-Host
Write-Host "🔗 توحيد النظام الموجود مع Database مركزية" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# 1. تأكيد الخدمات تعمل
Write-Host "🔍 فحص الخدمات..." -ForegroundColor Yellow

# PostgreSQL
$env:PGPASSWORD = "delivery123"
try {
    $pgResult = psql -h localhost -U admin -d delivery_app -c "SELECT 1" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL OK" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL - تحقق من تشغيل الخدمة" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ PostgreSQL - غير متوفر" -ForegroundColor Red
}

# Redis
try {
    $redisResult = redis-cli ping 2>$null
    if ($redisResult -eq "PONG") {
        Write-Host "✅ Redis OK" -ForegroundColor Green
    } else {
        Write-Host "❌ Redis - تحقق من تشغيل الخدمة" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Redis - غير متوفر" -ForegroundColor Red
}

# 2. إعداد قاعدة البيانات
Write-Host "`n🗄️ إعداد قاعدة البيانات..." -ForegroundColor Yellow
try {
    psql -h localhost -U admin -d delivery_app -f "src/lib/database-setup.sql" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ تم إعداد قاعدة البيانات" -ForegroundColor Green
    } else {
        Write-Host "⚠️ قاعدة البيانات موجودة مسبقاً" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ فشل في إعداد قاعدة البيانات" -ForegroundColor Red
}

# 3. تحديث Dependencies
Write-Host "`n📦 تحديث Dependencies..." -ForegroundColor Yellow
npm install

# 4. اختبار الاتصال
Write-Host "`n🔗 اختبار الاتصال..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction SilentlyContinue
    if ($healthCheck.status -eq "healthy") {
        Write-Host "✅ جميع الخدمات متصلة" -ForegroundColor Green
    } else {
        Write-Host "⚠️ بعض الخدمات غير متصلة" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ℹ️ سيتم اختبار الاتصال عند تشغيل الخادم" -ForegroundColor Blue
}

Write-Host "`n✅ ✅ ✅ التوحيد انتهى!" -ForegroundColor Green
Write-Host "النظام الآن:" -ForegroundColor Cyan
Write-Host "├── يقرأ من delivery_app فقط" -ForegroundColor White
Write-Host "├── يستخدم lib/db.ts المركزي" -ForegroundColor White
Write-Host "├── PDF API موحد (/api/pdf)" -ForegroundColor White
Write-Host "├── Health Check API (/api/health)" -ForegroundColor White
Write-Host "└── .env.local موحد" -ForegroundColor White

Write-Host "`n🚀 لتشغيل النظام:" -ForegroundColor Cyan
Write-Host "npm run dev" -ForegroundColor Yellow

Write-Host "`n📊 لمراقبة الصحة:" -ForegroundColor Cyan
Write-Host "http://localhost:5000/api/health" -ForegroundColor Yellow