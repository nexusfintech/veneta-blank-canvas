# Client Management System

## Overview

This is a full-stack web application for managing clients, built with a React frontend and Express.js backend. The application allows users to create, read, update, and delete client information for both individuals ("persona fisica") and companies ("azienda"). It features a modern UI with shadcn/ui components, form validation, search and filtering capabilities, and a RESTful API architecture.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Deployment Authentication Fix (2025-01-28)
- **Fixed authentication issues in public deployment** by adjusting session cookie configuration
- **Disabled secure cookies** for Replit deployment compatibility (secure: false)
- **Updated sameSite policy** to "lax" for better cross-origin support
- **Added CORS headers** for production environment compatibility
- **Enhanced error handling** in login form for network connectivity issues
- **Improved session reliability** for public deployment vs development environment

### Authentication System Implementation (2025-01-27)
- **Added PostgreSQL-based authentication system** replacing the previous system
- **Removed Statistics menu** from navigation as requested
- **Created two user accounts:**
  - Admin: mauro.frasson@venetagroup.com (password: Admin123!)
  - Regular user: app@nexusfintech.it (password: User123!)
- **Role-based access control:** Admin users can see all client contact information (email, phone, addresses), while regular users see limited data without contact details
- **Session management:** Using express-session with PostgreSQL store
- **Secure login page** with form validation and password visibility toggle
- **Automatic logout functionality** in navigation sidebar

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
The application uses a comprehensive `clients` table with contract-specific fields, plus authentication tables:
- **id**: Primary key (UUID)
- **type**: Client type ("persona_fisica" or "azienda")
- **Individual fields**: firstName, lastName, fiscalCode, birthDate
- **Company basic fields**: companyName, vatNumber, companyFiscalCode
- **Company extended fields**: legalAddress, legalZipCode, legalCity, legalProvince, fax, pec
- **Legal representative**: Complete personal data, residence, documents, PEP status, public roles
- **Beneficial owners**: Multiple owners with ownership percentages and compliance data
- **Geographic data**: mainActivityProvince, relationshipDestinationProvince, counterpartyAreaProvince
- **Product data**: requestedProduct, requestedCapital, financingDuration, interestRateType
- **Compensation**: mediatorCompensation, commission, instructionFees, contractDate
- **Contact fields**: email, phone, address, zipCode, city, province
- **Meta fields**: status, notes

**Authentication tables:**
- **users**: id, email, password (hashed), role (admin/user), firstName, lastName, timestamps
- **sessions**: sid, sess (JSON), expire (for session management)

### Frontend Components
- **Home Page**: Main dashboard with sidebar navigation and client management interface
- **SidebarNavigation**: Collapsible sidebar for desktop navigation with section icons
- **ClientModal**: Comprehensive form modal with contract-specific sections:
  - Dati Aziendali (Company Data)
  - Legale Rappresentante (Legal Representative) 
  - Titolari Effettivi (Beneficial Owners)
  - Area Geografica e Attività (Geographic Area & Activity)
  - Prodotto Richiesto (Requested Product)
  - Compenso e Oneri (Compensation & Fees)
- **ClientsTable**: Enhanced data table with clickable rows and contract generation placeholder
- **SearchFilters**: Advanced search and filter functionality
- **StatsCards**: Dashboard statistics display

### API Endpoints

**Authentication endpoints:**
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/logout` - User logout and session destruction
- `GET /api/auth/user` - Get current authenticated user info

**Client management endpoints (all protected by authentication):**
- `GET /api/clients` - Retrieve clients (admin sees all data, users see limited data without contact info)
- `GET /api/clients/:id` - Retrieve specific client (role-based data filtering)
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