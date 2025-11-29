# Delivery Management API Backend

A Node.js + Express backend API for the Delivery Management System with PostgreSQL database.

## Features

- **Authentication**: JWT-based auth with login/register
- **Orders API**: Full CRUD with filtering, sorting, pagination, bulk operations
- **Users API**: Manage admins, drivers, merchants, customer service
- **Roles API**: Role-based permissions management
- **Statuses API**: Order status workflow configuration
- **Areas API**: Cities and regions management
- **Financials API**: Driver and merchant payment slips
- **Returns API**: Return slips management

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Orders
- `GET /api/orders` - List orders (with filters)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/orders/bulk-status` - Bulk update status
- `DELETE /api/orders/:id` - Delete order
- `POST /api/orders/bulk-delete` - Bulk delete orders

### Users
- `GET /api/users` - List users
- `GET /api/users/drivers` - List drivers
- `GET /api/users/merchants` - List merchants
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Roles
- `GET /api/roles` - List roles
- `GET /api/roles/:id` - Get single role
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `PUT /api/roles/:id/permissions` - Update role permissions
- `DELETE /api/roles/:id` - Delete role

### Statuses
- `GET /api/statuses` - List statuses
- `GET /api/statuses/:id` - Get single status
- `POST /api/statuses` - Create status
- `PUT /api/statuses/:id` - Update status
- `DELETE /api/statuses/:id` - Delete status

### Areas
- `GET /api/areas/all` - Get all cities with regions
- `GET /api/areas/cities` - List cities
- `GET /api/areas/cities/:cityId/regions` - List regions by city
- `POST /api/areas/cities` - Create city
- `POST /api/areas/regions` - Create region
- `DELETE /api/areas/cities/:id` - Delete city
- `DELETE /api/areas/regions/:id` - Delete region

### Financials
- `GET /api/financials/driver-payments` - List driver payments
- `GET /api/financials/driver-payments/:id` - Get driver payment
- `POST /api/financials/driver-payments` - Create driver payment
- `DELETE /api/financials/driver-payments/:id` - Delete driver payment
- `GET /api/financials/merchant-payments` - List merchant payments
- `GET /api/financials/merchant-payments/:id` - Get merchant payment
- `POST /api/financials/merchant-payments` - Create merchant payment
- `PATCH /api/financials/merchant-payments/:id/status` - Update status
- `DELETE /api/financials/merchant-payments/:id` - Delete merchant payment

### Returns
- `GET /api/returns/driver-slips` - List driver return slips
- `GET /api/returns/driver-slips/:id` - Get driver return slip
- `POST /api/returns/driver-slips` - Create driver return slip
- `DELETE /api/returns/driver-slips/:id` - Delete driver return slip
- `GET /api/returns/merchant-slips` - List merchant return slips
- `GET /api/returns/merchant-slips/:id` - Get merchant return slip
- `POST /api/returns/merchant-slips` - Create merchant return slip
- `PATCH /api/returns/merchant-slips/:id/status` - Update status
- `DELETE /api/returns/merchant-slips/:id` - Delete merchant return slip

## Local Development

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your PostgreSQL settings

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run migrations:
   ```bash
   npm run migrate
   ```

5. Seed the database:
   ```bash
   npm run seed
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

## Docker Deployment

1. Build and start:
   ```bash
   docker-compose up -d
   ```

2. Run migrations (automatic on first run):
   ```bash
   docker-compose run --rm migrate
   ```

## VPS Deployment

1. Copy files to VPS:
   ```bash
   scp -r backend/ user@your-vps:/opt/delivery-backend/
   ```

2. Run setup:
   ```bash
   cd /opt/delivery-backend
   chmod +x deploy.sh
   ./deploy.sh setup
   ```

3. Edit environment:
   ```bash
   nano .env
   ```

4. Deploy:
   ```bash
   ./deploy.sh deploy
   ```

### Deployment Commands

- `./deploy.sh setup` - First time setup
- `./deploy.sh deploy` - Deploy/update
- `./deploy.sh start` - Start services
- `./deploy.sh stop` - Stop services
- `./deploy.sh restart` - Restart services
- `./deploy.sh logs` - View logs
- `./deploy.sh migrate` - Run migrations
- `./deploy.sh seed` - Seed database
- `./deploy.sh status` - Check status

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| JWT_SECRET | Secret for JWT tokens | - |
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development |
| FRONTEND_URL | Frontend URL for CORS | * |

## Default Credentials

After seeding, the default admin account is:
- Email: `admin@alwameed.com`
- Password: `123`

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Deployment**: Docker + Docker Compose
