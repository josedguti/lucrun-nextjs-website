# Lucrun - Running Coaching Website

A modern web application for running coaching services built with Next.js, featuring user authentication, personalized training programs, and admin management tools.

## Features

- **User Authentication**: Secure signup/login with Supabase Auth
- **Role-Based Access**: Admin and regular user dashboards with different navigation
- **Training Programs**: Access to personalized running programs
- **Health Surveys**: Comprehensive health questionnaires
- **Profile Management**: User profile with personal information
- **Video Content**: Access to training videos
- **Calendar Integration**: Scheduling and calendar features
- **Admin Panel**: Runner management tools for coaches

## Tech Stack

- **Framework**: Next.js 15.4.1 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Fonts**: Geist Sans and Geist Mono

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Supabase account and project setup

### Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx tsc --noEmit` - Run TypeScript compiler check

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public pages)/     # about, contact, pricing, programs
│   ├── dashboard/          # Protected dashboard pages
│   │   ├── profile/        # User profile management
│   │   ├── health-survey/  # Health questionnaire
│   │   ├── programs/       # Training programs
│   │   ├── runners/        # Admin: manage runners
│   │   ├── videos/         # Video content
│   │   └── calendar/       # Scheduling/calendar
│   ├── login/             # Authentication
│   ├── signup/            # User registration
│   └── layout.tsx         # Root layout with AuthProvider
├── components/            # Reusable React components
├── contexts/              # React contexts (AuthContext)
└── utils/                 # Utilities and Supabase config
```

## Authentication & Authorization

- **Admin User**: `luc.run.coach@gmail.com`
- **User Roles**: Admin users see additional navigation (Runners management)
- **Protected Routes**: Dashboard pages require authentication
- **Real-time Auth**: State managed via Supabase listeners

## Database Schema

The application uses Supabase with the following main table:
- `profiles`: User profile data (first_name, last_name, email)
