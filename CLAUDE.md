# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LucRun is a Next.js 15 web application for a professional running coach platform. It features a marketing website with client dashboard functionality, built with React 19, TypeScript, and Tailwind CSS.

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
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (configured but not fully implemented)
- **Authentication**: Supabase Auth (setup in progress)

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/         # Protected dashboard area
│   │   ├── calendar/
│   │   ├── health-survey/
│   │   ├── profile/
│   │   ├── programs/
│   │   └── videos/
│   ├── about/
│   ├── contact/
│   ├── pricing/
│   ├── programs/
│   └── layout.tsx         # Root layout with Navbar
├── components/            # Reusable components
│   ├── Navbar.tsx         # Main navigation
│   └── DashboardLayout.tsx # Dashboard sidebar layout
└── utils/
    └── supabase/          # Supabase client configuration
        ├── client.ts      # Browser client
        ├── server.ts      # Server client
        └── middleware.ts  # Middleware client
```

### Key Features

1. **Marketing Website**: Landing page with hero section, feature cards, and CTA
2. **Dashboard System**: Multi-step onboarding checklist with progress tracking
3. **Responsive Design**: Mobile-first approach with Tailwind CSS
4. **Authentication Ready**: Supabase integration prepared for auth implementation

### Dashboard Architecture

The dashboard uses a checklist-based onboarding system:
- Progress tracking with localStorage persistence
- Step-by-step completion flow
- Locked/unlocked states for sequential progression
- Success messages and visual feedback

### Styling Conventions

- Uses Tailwind CSS utility classes
- Geist font family (Sans and Mono variants)
- Blue/gray color scheme (blue-600 primary, gray-900 text)
- Responsive design with `sm:`, `md:`, `lg:` breakpoints
- Hover states and transitions throughout

### State Management

- React hooks for local state
- localStorage for dashboard progress persistence
- URL search params for success messages
- No external state management library currently

### Component Patterns

- Client components use "use client" directive
- Link components from Next.js for navigation
- Conditional rendering based on state
- Icon components using SVG elements
- Responsive navigation with mobile hamburger menu

## Development Notes

- Uses TypeScript strict mode
- Path aliases configured: `@/*` maps to `./src/*`
- ESLint configured with Next.js and TypeScript presets
- No test framework currently configured
- Tailwind CSS v4 with PostCSS integration

## Environment Variables

Required for Supabase integration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`