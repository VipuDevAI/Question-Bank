# School SAFAL - Multi-Tenant Question Bank & Assessment Platform

## Overview

School SAFAL is a multi-tenant SaaS Question Bank and Assessment platform designed for educational institutions. The application provides a comprehensive exam engine with mock tests, practice sessions, chapter-based learning with unlock systems, and role-based dashboards for teachers, students, parents, and administrators.

Key features include:
- Multi-tenant architecture with school isolation
- Question bank management with various question types (MCQ, True/False, Fill-in-the-blank, Matching, Numerical, Short/Long Answer)
- Chapter unlock system with state lifecycle (Draft → Locked → Unlocked → Completed)
- Mock exam engine with timed assessments
- Practice mode for self-paced learning
- Role-based access control (Super Admin, Admin, Teacher, Student, Parent)
- Bulk question upload and management

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for the olive green theme (#708238)
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API endpoints under `/api/*`
- **Authentication**: JWT-based authentication with role-based access control
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)

### Data Storage
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` contains all database table definitions
- **Migrations**: Drizzle Kit for database migrations (`/migrations` folder)

### Multi-Tenancy Design
- All entities include `tenant_id` for data isolation
- Middleware filters queries by tenant
- Super Admin can manage multiple schools/tenants
- Each school only sees its own data

### Design System
- **Primary Background**: Olive green (#708238)
- **Card System**: White rounded cards with shadows floating on olive background
- **Button System**: "Coin-style" colorful buttons with distinct color coding per action type
  - Blue: Login, Create, View actions
  - Gold: Upload, Premium actions
  - Green: Approve, Success states
  - Red: Destructive actions

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and auth context
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Data access layer interface
│   ├── static.ts     # Static file serving
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared types and schemas
│   └── schema.ts     # Drizzle ORM schema definitions
└── migrations/       # Database migrations
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database toolkit for TypeScript
- **connect-pg-simple**: PostgreSQL session store for Express

### Frontend Libraries
- **@tanstack/react-query**: Server state management
- **Radix UI**: Accessible UI component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **wouter**: Lightweight React router
- **react-hook-form**: Form state management
- **zod**: Schema validation

### Backend Libraries
- **Express**: Web framework
- **jsonwebtoken**: JWT authentication
- **multer**: File upload handling
- **nodemailer**: Email functionality
- **xlsx**: Spreadsheet parsing for bulk uploads

### Build Tools
- **Vite**: Frontend build tool and dev server
- **esbuild**: Backend bundling for production
- **tsx**: TypeScript execution for development

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Development tooling