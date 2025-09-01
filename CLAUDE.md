# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LucRun is a Next.js 15 web application for a professional running coach platform. It combines a marketing website with a comprehensive client dashboard system, featuring real-time authentication, admin/user role separation, and a complete training management system.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase with comprehensive schema
- **Authentication**: Supabase Auth with role-based access
- **State Management**: React Context (AuthContext) + local state

### Database Schema

The application uses a comprehensive Supabase schema with:
- **User Management**: Profiles table extending auth.users with detailed runner information
- **Training Programs**: 6 program types (beginner, 5k-10k, semi-marathon, marathon, trail-running, ultra-trail)
- **Health System**: Health surveys with medical certificate uploads
- **Training Sessions**: Scheduled sessions with RPE tracking and completion status
- **Video Library**: Categorized training videos with progress tracking
- **Dashboard Progress**: Onboarding checklist with automatic progress calculation
- **Row Level Security**: Comprehensive RLS policies for data protection
- **Admin Access**: Special admin email (luc.run.coach@gmail.com) with elevated permissions

### Authentication Architecture

- **AuthContext**: Global auth state management with admin detection
- **Middleware**: Route protection for `/dashboard/*` paths, auth redirect handling
- **ProtectedRoute**: Component wrapper for dashboard pages
- **Role-Based UI**: Different navigation and functionality for admin vs regular users

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected dashboard area (role-based)
│   │   ├── runners/       # Admin only - user management
│   │   ├── calendar/      # Training session calendar
│   │   ├── health-survey/ # Health questionnaire
│   │   ├── profile/       # User profile management
│   │   ├── programs/      # Training program selection
│   │   └── videos/        # Video library access
│   ├── login/page.tsx     # Authentication pages
│   ├── signup/page.tsx
│   └── layout.tsx         # Root layout with global providers
├── components/
│   ├── Navbar.tsx         # Main navigation with auth integration
│   ├── DashboardLayout.tsx # Sidebar layout with role-based navigation
│   └── ProtectedRoute.tsx # Auth guard wrapper
├── contexts/
│   └── AuthContext.tsx    # Global auth state and admin detection
└── utils/
    ├── auth.ts            # Auth helper functions
    └── supabase/          # Supabase client configuration
        ├── client.ts      # Browser client
        ├── server.ts      # Server-side client
        └── middleware.ts  # Middleware client
```

### Key Features

1. **Marketing Website**: Hero sections, program showcase, contact forms
2. **Dashboard System**: Role-based with admin/user interfaces
3. **Progress Tracking**: Automated dashboard progress calculation via database triggers
4. **Training Management**: Program enrollment, session scheduling, completion tracking
5. **Health Integration**: Medical certificates, health surveys with RLS protection
6. **Video System**: Categorized content with watch progress tracking

### Authentication Flow

- **Middleware**: Protects `/dashboard/*` routes, redirects unauthenticated users
- **AuthProvider**: Wraps entire app, provides user state and admin detection
- **Admin Detection**: Email-based (`luc.run.coach@gmail.com`)
- **ProtectedRoute**: Dashboard wrapper ensuring authentication
- **Role-Based Navigation**: Different sidebar menus for admin vs users

### Database Integration Patterns

- **Automatic Profile Creation**: Database trigger creates profile on user registration
- **Progress Tracking**: Database functions calculate completion percentages
- **RLS Security**: Users can only access their own data, admin can view all
- **Optimistic Updates**: Client-side state updates with database sync
- **Error Handling**: Comprehensive error boundaries with fallback states

### Styling System

- **Tailwind CSS v4**: Latest version with PostCSS integration
- **Design System**: Blue primary (#2563eb), gray neutrals
- **Typography**: Geist font family (Sans/Mono)
- **Responsive**: Mobile-first with sidebar collapse on mobile
- **Icons**: Inline SVG components throughout

### Configuration

- **TypeScript**: Strict mode with path aliases (`@/*` → `./src/*`)
- **ESLint**: Next.js and TypeScript presets
- **Next.js**: Image optimization for Unsplash, Turbopack for dev
- **Environment**: Supabase URL and anon key required

## Development Patterns

- **Client Components**: Marked with "use client" for interactivity
- **Server Actions**: Database operations through Supabase clients
- **Error Boundaries**: Comprehensive error handling with user feedback
- **Loading States**: Skeleton loaders and loading indicators throughout
- **Optimistic Updates**: Immediate UI updates with background sync

## Environment Variables

Required for Supabase integration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`