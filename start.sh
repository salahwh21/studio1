#!/bin/bash
# ============================================
#  🚀 الوميض - Alwameed Startup Script
#  Start both Backend (Express) & Frontend (Next.js)
# ============================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  🚀 الوميض - Alwameed Platform${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# ---- Check dependencies ----
check_deps() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
}

# ---- Install node_modules if missing ----
install_deps() {
    if [ ! -d "$PROJECT_DIR/node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        cd "$PROJECT_DIR" && npm install
    fi

    if [ ! -d "$PROJECT_DIR/backend/node_modules" ]; then
        echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
        cd "$PROJECT_DIR/backend" && npm install
    fi
}

# ---- Cleanup on exit ----
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID 2>/dev/null
    wait $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ All processes stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# ---- Main ----
check_deps
install_deps

# Start Backend
echo ""
echo -e "${BLUE}🔧 Starting Backend (Express) on port 3001...${NC}"
cd "$PROJECT_DIR/backend"
node src/index.js &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo -e "${BLUE}🌐 Starting Frontend (Next.js) on port 5000...${NC}"
cd "$PROJECT_DIR"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ✅ Both services are running!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "  ${CYAN}Frontend:${NC}  http://localhost:5000"
echo -e "  ${CYAN}Backend:${NC}   http://localhost:3001"
echo -e "  ${YELLOW}Press Ctrl+C to stop both${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
