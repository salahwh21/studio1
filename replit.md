# Firebase Studio - Delivery Management System

## Overview
This is a Next.js 15 delivery management application built with Firebase Studio. It provides a comprehensive dashboard for managing orders, drivers, merchants, returns, and financials.

## Project Structure
- **Framework**: Next.js 15.5.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand
- **Maps**: Leaflet with routing capabilities
- **AI Integration**: Google Genkit AI
- **Additional Features**: Excel/CSV export, PDF generation, barcode support

## Key Features
- User authentication and login system
- Dashboard with order management
- Driver tracking and map visualization
- Merchant and driver payment tracking
- Returns processing workflow
- Financial management and reporting
- Regional settings and customization
- Multi-stage workflow for orders and returns

## Environment Setup

### Development
The application runs on port 5000 and is configured to work with Replit's proxy environment.

### Configuration
- **Next.js Config**: `next.config.mjs` - Configured with allowed origins for server actions
- **Build System**: Uses npm with npx for running scripts
- **Dev Server**: Binds to 0.0.0.0:5000 for Replit compatibility

## Running the Application

### Development Mode
```bash
npm run dev
```
Runs on http://0.0.0.0:5000

### Build
```bash
npm run build
```

### Production
```bash
npm run start
```

## Recent Changes (Nov 29, 2025)
- Configured for Replit environment
- Updated Next.js config to allow all origins for server actions
- Set dev server to bind to 0.0.0.0:5000
- Removed duplicate next.config.ts file
- Configured workflow for automatic startup

## Project Dependencies
Key packages include:
- Next.js, React, TypeScript
- Radix UI components for accessible UI
- Leaflet for maps and routing
- Firebase for backend services
- Zustand for state management
- ExcelJS, jsPDF for exports
- Google Genkit for AI features

## Notes
- TypeScript and ESLint build errors are ignored in the config
- The app uses experimental server actions with increased body size limit
- Telemetry is enabled by default (can be disabled per Next.js docs)
