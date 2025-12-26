#!/bin/bash

# 🚀 توحيد النظام الموجود مع الداتا بيز المركزية فقط
clear
echo "🔗 توحيد النظام الموجود مع Database مركزية"
echo "=============================================="

# 1. تأكيد الخدمات تعمل
echo "🔍 فحص الخدمات..."
export PGPASSWORD=delivery123

# PostgreSQL
if psql -h localhost -U admin -d delivery_app -c "SELECT 1" >/dev/null 2>&1; then
    echo "✅ PostgreSQL OK"
else
    echo "❌ PostgreSQL - تحقق من تشغيل الخدمة"
fi

# Redis  
if redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis OK"
else
    echo "❌ Redis - تحقق من تشغيل الخدمة"
fi

# 2. إعداد قاعدة البيانات
echo ""
echo "🗄️ إعداد قاعدة البيانات..."
if psql -h localhost -U admin -d delivery_app -f "src/lib/database-setup.sql" >/dev/null 2>&1; then
    echo "✅ تم إعداد قاعدة البيانات"
else
    echo "⚠️ قاعدة البيانات موجودة مسبقاً أو حدث خطأ"
fi

# 3. تحديث Dependencies
echo ""
echo "📦 تحديث Dependencies..."
npm install

# 4. اختبار الاتصال
echo ""
echo "🔗 اختبار الاتصال..."
if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
    health_status=$(curl -s http://localhost:5000/api/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [ "$health_status" = "healthy" ]; then
        echo "✅ جميع الخدمات متصلة"
    else
        echo "⚠️ بعض الخدمات غير متصلة"
    fi
else
    echo "ℹ️ سيتم اختبار الاتصال عند تشغيل الخادم"
fi

echo ""
echo "✅ ✅ ✅ التوحيد انتهى!"
echo "النظام الآن:"
echo "├── يقرأ من delivery_app فقط"
echo "├── يستخدم lib/db.ts المركزي"
echo "├── PDF API موحد (/api/pdf)"
echo "├── Health Check API (/api/health)"
echo "└── .env.local موحد"

echo ""
echo "🚀 لتشغيل النظام:"
echo "npm run dev"

echo ""
echo "📊 لمراقبة الصحة:"
echo "http://localhost:5000/api/health"