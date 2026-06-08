#!/bin/bash
set -e

echo "=========================================="
echo "    Studio1 Codespaces Setup Script       "
echo "=========================================="

echo "[1/4] Waiting for PostgreSQL to be ready..."
# The Postgres feature starts the service in the background, we just wait a bit to ensure it's up
sleep 3

# Create the specific delivery_db using the password directly to avoid sudo prompts
PGPASSWORD='Sbreen$1967' createdb -h localhost -U postgres delivery_db || true
echo "✅ Database 'delivery_db' created."

echo "[2/4] Setting up Backend environment..."
cd backend

# Create or overwrite the .env file with the correct credentials for Codespaces
cat << 'EOF' > .env
DATABASE_URL=postgresql://postgres:Sbreen$1967@localhost:5432/delivery_db
PORT=3001
NODE_ENV=development
JWT_SECRET=codespaces-development-secret-key-change-me
FRONTEND_URL=http://localhost:5000
EOF
echo "✅ Backend .env file generated."

echo "[3/4] Installing dependencies and seeding Database..."
npm install

# Run database migrations and seed it with initial data
echo "Running Migrations..."
npm run migrate
echo "Running Seed..."
npm run seed
echo "✅ Backend ready."

echo "[4/4] Setting up Frontend environment..."
cd ..
npm install
echo "✅ Frontend ready."

echo "=========================================="
echo "✨ All Done! Welcome to GitHub Codespaces. "
echo "To start working, open two terminal tabs:"
echo " 1. 'cd backend && npm run dev'"
echo " 2. 'npm run dev' (at root)"
echo "=========================================="
