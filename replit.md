# Client Management System

## Overview

This is a full-stack web application for managing clients, built with a React frontend and Express.js backend. The application allows users to create, read, update, and delete client information for both individuals ("persona fisica") and companies ("azienda"). It features a modern UI with shadcn/ui components, form validation, search and filtering capabilities, and a RESTful API architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Validation**: Zod schemas for request/response validation
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### Database Schema
The application uses a single `clients` table with the following structure:
- **id**: Primary key (UUID)
- **type**: Client type ("persona_fisica" or "azienda")
- **Individual fields**: firstName, lastName, fiscalCode, birthDate
- **Company fields**: companyName, vatNumber, companyFiscalCode
- **Contact fields**: email, phone, address, zipCode, city, province
- **Meta fields**: status, notes

### Frontend Components
- **Home Page**: Main dashboard with client management interface
- **ClientModal**: Form modal for creating/editing clients with dynamic field validation
- **ClientsTable**: Data table with CRUD operations and responsive design
- **SearchFilters**: Search and filter functionality
- **StatsCards**: Dashboard statistics display

### API Endpoints
- `GET /api/clients` - Retrieve clients with optional search and filtering
- `GET /api/clients/:id` - Retrieve specific client
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update existing client
- `DELETE /api/clients/:id` - Delete client
- `GET /api/stats` - Retrieve dashboard statistics

## Data Flow

1. **Client Interaction**: Users interact with React components in the frontend
2. **State Management**: TanStack Query manages API calls and caching
3. **API Communication**: Frontend makes HTTP requests to Express.js backend
4. **Validation**: Zod schemas validate incoming requests
5. **Data Storage**: Currently uses in-memory storage (MemStorage) with PostgreSQL schema ready for migration
6. **Response**: Data flows back through the same chain with proper error handling

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation
- **Validation**: Zod for runtime type checking
- **Styling**: Tailwind CSS with CSS variables for theming

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod schemas shared between frontend and backend
- **Session Storage**: connect-pg-simple for PostgreSQL session store

### Development Dependencies
- **TypeScript**: Full type safety across the stack
- **Vite**: Fast development server and build tool
- **ESBuild**: Fast backend bundling for production

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: Drizzle Kit for schema management and migrations

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Deployment**: Single Node.js process serves both static files and API

### Database Management
- **Schema**: Defined in `shared/schema.ts` using Drizzle ORM
- **Migrations**: Generated in `./migrations` directory
- **Connection**: Uses DATABASE_URL environment variable for PostgreSQL connection

### Environment Configuration
The application requires:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment setting (development/production)

The current implementation uses in-memory storage for development but includes complete PostgreSQL schema and configuration for production deployment. The shared schema approach ensures type safety between frontend and backend while supporting Italian business requirements (fiscal codes, VAT numbers, etc.).