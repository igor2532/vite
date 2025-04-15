# Inventory Management System

A web application for managing inventory with roles for clients, managers, and admins.

## Structure
- `server/`: Backend (Express, MySQL)
- `client/`: Frontend (React, Vite)

## Setup
1. **Backend**:
   - Navigate to `server/`
   - Install dependencies: `npm install`
   - Create `.env` with `JWT_SECRET` and database credentials
   - Apply database dump: `mysql -u root -p inventory_db < db/dump.sql`
   - Run: `npm run dev`

2. **Frontend**:
   - Navigate to `client/`
   - Install dependencies: `npm install`
   - Run: `npm run dev`

## Features
- User authentication (login/register)
- Role-based access (client, manager, admin)
- Manage organizations, nomenclatures, products
- Drag & drop for organizations
- Search and filtering

## License
MIT