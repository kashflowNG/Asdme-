# Neropage - Social Media Link Landing Page Builder

## Overview

Neropage is a modern, neon-themed platform for creating personalized social media link landing pages. It provides users with a single hub to aggregate all their social media profiles and links, featuring a futuristic neo-neon aesthetic. The application is built as a Progressive Web App (PWA) with offline-first capabilities, allowing users to create and manage their link pages with a mobile-first, visually striking interface inspired by platforms like Linktree and Beacons.

**Core Purpose**: Enable users to create a branded landing page that consolidates all their social media links and online presence into a single, shareable URL.

**Target Use Case**: Content creators, influencers, and professionals who need a simple way to share multiple links through a single, visually appealing page.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: TailwindCSS with custom neo-neon theme configuration

**Design Rationale**: The choice of Vite provides extremely fast hot module replacement during development, while React Query eliminates the need for complex state management libraries by handling server state, caching, and synchronization automatically. Wouter was chosen over React Router for its minimal bundle size and simplicity.

**Key Pages**:
- Dashboard (`/`) - Profile editor and link management interface
- Public Profile (`/user/:username`) - Publicly viewable landing page with all social links

**Offline Support**: 
- Service Worker implementation for caching static assets and API responses
- TanStack Query persistence layer stores cached data in localStorage
- Users can view their profile and links even without internet connection

**Drag-and-Drop**: Uses @dnd-kit library for reordering social links with keyboard accessibility support.

### Backend Architecture

**Framework**: Express.js with TypeScript
- **Server Setup**: Custom Vite middleware integration for development HMR
- **API Design**: RESTful endpoints for profile and social link management
- **Validation**: Zod schemas for runtime type validation

**Storage Layer**: Currently file-based JSON storage (FileStorage class)
- **Profile Data**: `data/profiles.json`
- **Social Links**: `data/links.json`
- **Design Decision**: File-based storage chosen for simplicity and easy migration path to database
- **Interface Pattern**: IStorage interface abstracts storage implementation, making it trivial to swap to PostgreSQL/Drizzle later

**API Endpoints**:
- `GET /api/profiles/me` - Fetch default profile
- `GET /api/profiles/:username` - Fetch profile by username
- `PATCH /api/profiles/me` - Update profile
- `GET /api/profiles/:username/links` - Fetch social links
- `POST /api/links` - Create new social link
- `DELETE /api/links/:id` - Delete social link
- `PATCH /api/links/reorder` - Reorder links via drag-and-drop

**Development vs Production**:
- Development: Vite dev server with HMR middleware
- Production: Compiled Express server serving static assets from `dist/public`

### Data Models

**Database Schema** (Drizzle ORM):
- **profiles** table: id, username (unique), bio, avatar
- **social_links** table: id, profileId, platform, url, customTitle, order

**Type Safety**: TypeScript types generated from Drizzle schemas and shared between client/server via `shared/schema.ts`

**Migration Ready**: Drizzle configuration present (`drizzle.config.ts`) for future PostgreSQL migration via Neon Database

### Design System

**Neo-Neon Theme**:
- Primary colors: Neon Purple (#8B5CF6), Electric Blue (#3B82F6), Cyber Cyan (#06B6D4), Soft Magenta (#EC4899)
- Dark backgrounds: Deep Midnight Black (#0A0F1F), Carbon Slate Gray (#1E293B)
- Visual effects: Neon glows, gradient borders, blur-glass cards, floating animations
- Typography: DM Sans/Inter for modern, clean readability

**Component Strategy**: 
- Shadcn/ui provides unstyled, accessible primitives
- Custom theme variables in CSS override default Shadcn colors
- Consistent spacing system using Tailwind utilities (2, 4, 6, 8, 12, 16px units)

**Responsive Design**: Mobile-first approach with max-width containers and single-column layouts optimized for social sharing.

## External Dependencies

### Third-Party Services

**Neon Database** (Configured but not yet active):
- PostgreSQL-compatible serverless database
- Connection via `@neondatabase/serverless` driver
- Environment variable: `DATABASE_URL`
- **Current Status**: Drizzle schema and config ready; currently using file storage

### Frontend Libraries

**UI & Interaction**:
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **@dnd-kit**: Drag-and-drop functionality with accessibility support
- **react-icons**: Icon library including SimpleIcons for social platform logos
- **lucide-react**: Modern icon set for UI elements

**Data Management**:
- **TanStack Query**: Server state management with automatic caching
- **@tanstack/query-sync-storage-persister**: Persist cache to localStorage for offline support
- **Zod**: Runtime schema validation shared between client and server

**Styling**:
- **TailwindCSS**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variant management
- **tailwind-merge**: Intelligent class merging utility

### Backend Libraries

**Server Framework**:
- **Express.js**: Web server and API routing
- **Vite**: Development server with HMR middleware integration

**Database & ORM** (Prepared for migration):
- **Drizzle ORM**: Type-safe SQL query builder
- **drizzle-kit**: Schema migrations and management
- **@neondatabase/serverless**: PostgreSQL driver for Neon

**Build & Development**:
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production server code

### PWA Capabilities

**Service Worker**: Custom implementation in `client/public/service-worker.js`
- Caches static assets and API responses
- Network-first strategy for API calls with cache fallback
- Cache versioning for automatic updates

**Web App Manifest**: `client/public/manifest.json`
- Defines app name, icons, theme colors
- Enables "Add to Home Screen" on mobile devices
- Standalone display mode for app-like experience

### Font Loading

**Google Fonts**: Preconnected in HTML for performance
- DM Sans: Primary UI font
- Fira Code: Monospace font for code elements
- Geist Mono: Alternative monospace option
- Architects Daughter: Decorative font option