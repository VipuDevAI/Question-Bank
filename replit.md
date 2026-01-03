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

## Recent Changes (Jan 3, 2026)

### Post-Exam Feedback System
- **Exam Results Tabs**: After completing a mock test, students see 3 tabs: Score, Feedback, Review
- **Strengths/Weaknesses Analysis**: Topics are analyzed by performance (70%+ = strength, below 70% = needs improvement)
- **Practice Recommendations**: Buttons link directly to practice mode with subject/chapter/topic pre-filtered
- **Question-by-Question Review**: Shows each question's status (correct/incorrect) with the student's answer vs correct answer
- **Bulk Question Upload**: Teachers can upload questions via CSV with comprehensive validation (MCQ options, marks 1-100, required fields)

## Recent Changes (Jan 1, 2026)

### Wing-wise HOD Scoping & Teacher Management
- **HOD Wing Assignment**: HODs now have both subject AND wing displayed (auto-populated from user profile). Primary English HOD only sees Primary (1-5) English papers.
- **Language Settings**: Default languages are Tamil, Hindi, Sanskrit, French with "Add Language" button for custom school languages per wing.
- **Teacher Upload Form**: Separate form in Admin dashboard with fields: Name, UserID, Password, Role (fixed as Teacher), Subject, Wing, Contact, Email, Status.
- **Bulk Teacher Upload**: CSV template with columns: Name | UserID | Password | Role | Subject | Wing | Contact | Status

### Dashboard Overhaul - Production Ready
- **Demo Data Removed**: All static demo/mock data replaced with API queries (upcomingExams, recentResults, pendingQuestions, pendingPapers, schools, auditLogs)
- **Empty States Added**: All tables now show "No data available" messages when API returns empty arrays
- **Teacher Dashboard**: Subject auto-populated from user's department, no dropdown needed
- **HOD Dashboard**: Subject auto-populated - HOD sees only their assigned subject
- **Principal Dashboard**: Changed to monitor-only mode - removed approve/reject buttons
- **Exam Committee**: Added PDF and Word download options for question papers
- **Admin Dashboard**: 
  - Simplified parent columns (removed ParentID/Dashboard ID)
  - Added wing-wise language settings (2nd/3rd language per wing)
  - Added exam schedule upload (PDF preferred, Word supported)
  - Updated workflow to show correct flow: Teacher → HOD → Committee (Principal monitors)

### UI Improvements
- **Text Contrast**: Darkened foreground colors for better visibility (card-foreground, muted-foreground, etc.)
- **Favicon**: Replaced Replit favicon with project logo.png

### Workflow Clarification
- **Simplified Pipeline**: Teacher uploads → HOD reviews/generates → Committee approves & locks
- **Principal Role**: Monitor only - can view papers but cannot edit or approve
- **Committee Role**: Final approval and print management with PDF/Word download

## Recent Changes (Dec 31, 2025)

### Export Features
- **DOCX Export**: Question papers and answer keys can be exported as Word documents with school headers/footers
- **CSV Export**: Analytics exports for student-wise results and class-wise summary reports
- **PDF Export**: A4/Legal format question papers with proper formatting

### Exam Security
- **Tab-Switch Detection**: visibilitychange API monitors and logs when students switch tabs during exams
- **Risk Alerts**: Automatic creation of risk alerts after multiple tab switches
- **Activity Logging**: All tab switches are logged for audit purposes

### Math/LaTeX Support
- **MathText Component**: Renders common LaTeX commands (fractions, superscripts, subscripts, Greek letters)
- **XSS Protection**: HTML escaping applied before rendering math content

### Role-Based Access Control
- **Download Restrictions**: Teachers cannot see/download final papers and answer keys (UI-level enforcement)
- Teachers can still upload questions but cannot access final exam papers

### Parent Dashboard Enhancements
- **Activity Timeline**: Shows recent test completions and starts with visual indicators
- **Parallel Fetching**: Uses Promise.all for efficient data loading
- **Defensive Checks**: Handles missing timestamps gracefully

### Analytics Enhancements
- **Time Range Filter**: Filter data by 7 days, 30 days, 90 days, or all time
- **Subject Distribution**: Pie chart showing performance by subject
- **Color-Coded Scores**: Visual performance indicators (green/yellow/red)
- **Backend Integration**: Analytics API honors timeRange parameter for filtered data

## Storage Configuration

### How to Connect Cloud Storage for File Uploads

The Admin Dashboard has a Storage Configuration section (Settings tab) where you can configure cloud storage for safe file uploads. Here's how to set it up:

**Option 1: AWS S3**
1. Go to AWS Console → S3 → Create Bucket
2. Create an IAM user with S3 permissions (AmazonS3FullAccess or custom policy)
3. In Admin Settings → Storage Configuration:
   - Select "AWS S3" as provider
   - Enter your bucket name
   - Enter Access Key and Secret Key from IAM
4. Click "Test Connection" then "Save"

**Option 2: DigitalOcean Spaces**
1. Go to DigitalOcean → Spaces → Create Space
2. Generate Spaces access keys in API settings
3. In Admin Settings → Storage Configuration:
   - Select "DigitalOcean Spaces" as provider
   - Enter Space name as bucket
   - Enter Access Key and Secret Key
4. Click "Test Connection" then "Save"

**Option 3: Firebase Storage**
1. Set up Firebase project with Storage enabled
2. Generate service account credentials
3. Configure in Admin Settings similar to above

**Important**: Credentials are stored securely as environment secrets. The backend validates storage connectivity before accepting uploads.

## Known Limitations
- Server-side auth middleware for download routes needs proper JWT validation for production
- Math rendering is CSS-based, not full LaTeX (KaTeX integration would be more robust)
- Bulk upload validation needs comprehensive field checks
- **Backend APIs Pending**: Dashboard useQuery calls target endpoints not yet implemented (e.g., /api/student/upcoming-exams, /api/principal/papers, /api/admin/schools, /api/subjects, /api/chapters, /api/wings, /api/classes). Empty states handle this gracefully.
- **AuthUser Extension Needed**: User object needs department, classLevel, section, rollNumber, schoolName properties for full functionality (currently uses 'as any' casts)
- **Storage Backend**: The Storage Configuration UI is ready but backend implementation for file uploads needs to be connected to chosen provider