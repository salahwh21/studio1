#!/bin/bash

# API Testing Script
# Usage: ./test-api.sh [endpoint]

API_URL=${API_URL:-"http://localhost:3001/api"}

echo "🧪 Testing Delivery API"
echo "API URL: $API_URL"
echo ""

# Test health endpoint
echo "1️⃣  Testing health check..."
curl -s "$API_URL/health" | jq '.' || echo "❌ Health check failed"
echo ""

# Test login
echo "2️⃣  Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alwameed.com","password":"123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token' 2>/dev/null)
if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
  echo "✅ Login successful"
  echo "Token: ${TOKEN:0:20}..."
else
  echo "❌ Login failed"
  echo $LOGIN_RESPONSE | jq '.'
  exit 1
fi
echo ""

# Test get current user
echo "3️⃣  Testing get current user..."
curl -s "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.' || echo "❌ Failed"
echo ""

# Test get orders
echo "4️⃣  Testing get orders..."
curl -s "$API_URL/orders" \
  -H "Authorization: Bearer $TOKEN" | jq '.orders | length' | xargs echo "📦 Orders found:"
echo ""

# Test get cities
echo "5️⃣  Testing get areas..."
curl -s "$API_URL/areas/cities" | jq '.[] | .name' | head -3 | xargs echo "🏙️  Cities:"
echo ""

# Test get statuses
echo "6️⃣  Testing get statuses..."
curl -s "$API_URL/statuses" | jq '.[] | .name' | head -3 | xargs echo "📊 Statuses:"
echo ""

echo "✅ Basic API tests completed!"
echo ""
echo "Next: Try creating an order:"
echo "curl -X POST $API_URL/orders \\"
echo "  -H 'Authorization: Bearer $TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"recipient\":\"Test User\",\"phone\":\"0791234567\",\"address\":\"Test Address\",\"city\":\"عمان\",\"cod\":50}'"
