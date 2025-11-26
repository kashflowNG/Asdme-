# Neropage - Social Media Link Landing Page Builder

## Overview

Neropage is a modern, neon-themed platform for creating personalized social media link landing pages. It provides users with a single hub to aggregate all their social media profiles and links, featuring a futuristic neo-neon aesthetic. The application is built as a Progressive Web App (PWA) with offline-first capabilities, allowing users to create and manage their link pages with a mobile-first, visually striking interface inspired by platforms like Linktree and Beacons.

**Core Purpose**: Enable users to create a branded landing page that consolidates all their social media links and online presence into a single, shareable URL.

**Target Use Case**: Content creators, influencers, and professionals who need a simple way to share multiple links through a single, visually appealing page.

## Recent Changes (November 26, 2025)

### Video Background Trimmer Feature (COMPLETE)
- **Interactive Video Trimmer Component** - Users can upload videos and select exactly which 5-second clip they want
  - Real-time timeline visualization with drag-to-select
  - Shows start/end times in MM:SS format
  - Play/pause controls for preview
  - Visual timeline bar showing selected region
- **Backend Video Processing** - FFmpeg-based trimming on server side
  - `/api/upload-video` endpoint accepts video uploads with start/end times
  - Trims video to user-selected 5-second clip
  - Supports MP4, WebM, OGG formats (up to 100MB)
  - Falls back gracefully if FFmpeg unavailable
- **Integrated into Dashboard** - Added VideoTrimmer component to Appearance settings
  - Users can still paste URL OR upload & trim file
  - Background video field stores both trimmed and URL sources
  - Toast notifications on upload success/failure

### Landing Page Redesign (COMPLETE)
- **Linktree/Beacons-Style Layout** - Replaced Facebook-style overlapping design with clean centered layout
  - Single column, focused design
  - Avatar centered at top with verification badge
  - Username, bio, and links all center-aligned
  - Mobile-optimized for all screen sizes
- **Removed Metrics per User Request**
  - NO click counts displayed on public profile
  - NO view counts or analytics visible to visitors
  - NO stats summary boxes
  - NO testimonials section
  - NO popular links widget
  - Focus purely on content and links

### User Preferences Implemented
- **NO stats on public landing pages** - All analytics hidden from public view
- **NO testimonials** - Removed social proof testimonials section
- **Design choice**: Linktree/Beacons-style centered layout instead of complex overlapping design
- **Clean, minimal focus** - Profile page focused solely on user content and links

## Production Status

**Deployment Configuration**: Autoscale with automatic build
- Build command: `npm run build`
- Run command: `node dist/index.js`
- Ready to publish via Replit deployment

**Build Status**: ✅ Production build succeeds
- Frontend: 743.26 kB (gzip: 223.58 kB)
- Backend: 79.4 kB
- All assets optimized

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: TailwindCSS with custom neo-neon theme configuration

**Key Pages**:
- Dashboard (`/`) - Profile editor and link management interface
- Public Profile (`/user/:username`) - Publicly viewable landing page with all social links

**Key Components**:
- `VideoTrimmer.tsx` - Interactive video selection with timeline slider
- `AppearanceEditor.tsx` - Profile customization including video background upload
- `public-profile.tsx` - Clean Linktree-style landing page rendering

### Backend Architecture

**Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (Neon Database)
- **API Design**: RESTful endpoints for profile and social link management
- **Validation**: Zod schemas for runtime type validation
- **File Upload**: Multer with rate limiting (20 uploads/hour per user)

**Key Endpoints**:
- `GET /api/profiles/me` - Fetch current user's profile
- `PATCH /api/profiles/me` - Update profile including appearance settings
- `GET /api/profiles/:username` - Fetch public profile by username
- `POST /api/upload-image` - Upload avatar/background images
- `POST /api/upload-video` - Upload and trim background videos
- `GET /api/links` - Fetch user's links
- `POST /api/links` - Create new link
- `DELETE /api/links/:id` - Delete link

**Video Processing**:
- Uses FFmpeg for video trimming
- Stores videos in `data/uploads` directory
- Serves via `/uploads` endpoint with proper MIME types
- Supports multiple video formats with fallback handling

### Data Models

**Core Tables** (Drizzle ORM):
- **profiles**: User profile data including username, bio, avatar, background video/image
- **social_links**: Social media links with ordering, scheduling, and click tracking
- **content_blocks**: User-created content blocks (videos, images, text, forms)
- **form_submissions**: Contact form submissions from public profiles
- **ready_made_templates**: Admin-curated template library with draft/deploy workflow

### Design System

**Neo-Neon Theme**:
- Primary colors: Neon Purple (#8B5CF6), Electric Blue (#3B82F6), Cyber Cyan (#06B6D4)
- Dark backgrounds: Deep Midnight Black (#0A0F1F), Carbon Slate Gray (#1E293B)
- Visual effects: Neon glows, gradient borders, blur-glass cards

**Component Strategy**: 
- Shadcn/ui provides unstyled, accessible primitives
- Custom theme variables in CSS override default Shadcn colors
- Consistent spacing and responsive design

## External Dependencies

### Video Processing
- **ffmpeg-static**: FFmpeg binaries for server-side video trimming and compression

### Database
- **Neon Database**: PostgreSQL serverless backend
- **Drizzle ORM**: Type-safe SQL query builder
- **@neondatabase/serverless**: PostgreSQL driver for Neon

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **@dnd-kit**: Drag-and-drop for link reordering
- **TanStack Query**: Server state management with offline support
- **TailwindCSS**: Utility-first CSS framework

### Backend Libraries
- **Express.js**: Web server and API routing
- **Multer**: File upload handling with validation
- **bcrypt**: Password hashing and verification
- **jsonwebtoken**: JWT authentication tokens

## Completed Features

- ✅ User authentication (signup/login/logout)
- ✅ Profile customization (avatar, bio, theme, colors)
- ✅ Social link management with drag-and-drop reordering
- ✅ Link scheduling (show/hide links by date range)
- ✅ Content blocks (videos, images, text, contact forms)
- ✅ Contact form submissions tracking
- ✅ Admin dashboard with user management
- ✅ Custom domain support
- ✅ SEO optimization (meta tags, OG tags)
- ✅ Video background upload with interactive 5-second trimmer
- ✅ Template system with draft/deploy workflow
- ✅ Link analytics (admin only)
- ✅ User deletion with cascading deletes
- ✅ Location tracking for user logins (admin view)
- ✅ Linktree/Beacons-style public profile layout

## User Preferences

- Simple, everyday language communication style
- Focus on clean, minimal design without analytics on public profiles
- Interactive features like video trimming that give users control
- Production-ready from day one
