#!/bin/bash

# Delivery App Backend - VPS Deployment Script
# Usage: ./deploy.sh [option]
# Options:
#   setup     - First time setup
#   deploy    - Deploy/update the application
#   start     - Start the services
#   stop      - Stop the services
#   restart   - Restart the services
#   logs      - View logs
#   migrate   - Run database migrations
#   seed      - Seed the database
#   status    - Check service status

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="delivery-api"
APP_DIR="/opt/delivery-backend"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
}

setup() {
    log_info "Setting up Delivery Backend on VPS..."
    
    check_docker
    
    # Create app directory
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    
    # Copy files
    cp -r . $APP_DIR/
    
    # Create .env file if it doesn't exist
    if [ ! -f "$APP_DIR/.env" ]; then
        cp $APP_DIR/.env.example $APP_DIR/.env
        log_warn "Created .env file from .env.example. Please update with your settings."
        log_warn "Important: Update JWT_SECRET and FRONTEND_URL in .env"
    fi
    
    # Set up firewall (if ufw is installed)
    if command -v ufw &> /dev/null; then
        sudo ufw allow 3001/tcp
        sudo ufw allow 5432/tcp
        log_info "Firewall rules added for ports 3001 and 5432"
    fi
    
    log_info "Setup complete!"
    log_info "Next steps:"
    echo "  1. Edit $APP_DIR/.env with your settings"
    echo "  2. Run: ./deploy.sh deploy"
}

deploy() {
    log_info "Deploying Delivery Backend..."
    
    check_docker
    
    cd $APP_DIR
    
    # Build and start services
    docker compose build
    docker compose up -d
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations
    docker compose run --rm migrate
    
    log_info "Deployment complete!"
    log_info "Backend API is running at http://localhost:3001"
}

start() {
    log_info "Starting services..."
    cd $APP_DIR
    docker compose up -d
    log_info "Services started!"
}

stop() {
    log_info "Stopping services..."
    cd $APP_DIR
    docker compose down
    log_info "Services stopped!"
}

restart() {
    log_info "Restarting services..."
    cd $APP_DIR
    docker compose restart
    log_info "Services restarted!"
}

logs() {
    cd $APP_DIR
    docker compose logs -f --tail=100
}

migrate() {
    log_info "Running database migrations..."
    cd $APP_DIR
    docker compose run --rm migrate npm run migrate
    log_info "Migrations complete!"
}

seed() {
    log_info "Seeding database..."
    cd $APP_DIR
    docker compose run --rm migrate npm run seed
    log_info "Seeding complete!"
}

status() {
    cd $APP_DIR
    docker compose ps
    echo ""
    log_info "Health check:"
    curl -s http://localhost:3001/api/health || echo "Backend not responding"
}

# Main script
case "$1" in
    setup)
        setup
        ;;
    deploy)
        deploy
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    migrate)
        migrate
        ;;
    seed)
        seed
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {setup|deploy|start|stop|restart|logs|migrate|seed|status}"
        echo ""
        echo "Commands:"
        echo "  setup     - First time setup"
        echo "  deploy    - Deploy/update the application"
        echo "  start     - Start the services"
        echo "  stop      - Stop the services"
        echo "  restart   - Restart the services"
        echo "  logs      - View logs"
        echo "  migrate   - Run database migrations"
        echo "  seed      - Seed the database"
        echo "  status    - Check service status"
        exit 1
        ;;
esac
