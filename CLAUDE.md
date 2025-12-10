# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an event management website built with React, TypeScript, Vite, and Supabase. The site showcases events (breakfasts/"завтраки"), allows user registration, and includes an admin panel for managing events, participants (leads), and sponsors.

## Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build in development mode (includes component tagger)
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5 with SWC
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom theme
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Backend**: Supabase (authentication, database)
- **Forms**: React Hook Form + Zod validation

## Project Architecture

### Routing Structure

Routes are defined in `src/App.tsx`:
- `/` - Main landing page (Index)
- `/admin` - Admin panel (requires authentication)
- `/event/evening-november-25` - Event detail page
- `/event/evening-grodno-november-20` - Grodno event page
- `*` - 404 Not Found page

**Important**: When adding new routes, they MUST be placed ABOVE the catch-all `*` route in App.tsx.

### Page Components

Main pages in `src/pages/`:
- `Index.tsx` - Landing page composed of multiple sections
- `Admin.tsx` - Admin dashboard with tabs for managing events, leads, and sponsors
- `EventDetail.tsx` & `EventGrodno.tsx` - Individual event pages
- `NotFound.tsx` - 404 page

### Landing Page Structure

The main landing page (`Index.tsx`) is composed of these section components (in order):
1. `Navbar` - Top navigation
2. `HeroSection` - Hero banner
3. `AboutSection` - About the event series
4. `EventsSection` - List of upcoming events
5. `TeamSection` - Team members
6. `SponsorsSection` - Event sponsors
7. `RegisterSection` - Registration form
8. `Footer` - Footer

### Admin Panel

Admin panel (`src/pages/Admin.tsx`) features:
- **Authentication**: Uses localStorage for admin token (`admin_token` key)
- **Login Component**: `AdminLogin.tsx` handles authentication
- **Three Management Sections** (tabs):
  - Events Manager (`EventsManager.tsx`)
  - Leads Manager (`LeadsManager.tsx`) - participant management
  - Sponsors Manager (`SponsorsManager.tsx`)

Admin components are located in `src/components/admin/`.

### Supabase Integration

Supabase client and types in `src/integrations/supabase/`:
- `client.ts` - Configured Supabase client (auto-generated)
- `types.ts` - TypeScript database types (auto-generated)
- `setup.ts` - Initial data setup functions

**Database Tables**:
- `admins` - Admin users
- `events` - Event records
- `leads` - Event participants/registrations
- `sponsors` - Sponsor information
- `event_sponsors` - Join table for events and sponsors

### Path Aliases

The project uses `@/` as an alias for the `src/` directory:
```typescript
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
```

### UI Components

shadcn/ui components are in `src/components/ui/`. These are pre-built, customizable components based on Radix UI primitives. When adding new shadcn components, they should be placed in this directory.

### Styling System

Custom Tailwind theme defined in `tailwind.config.ts`:
- **Fonts**: Inter (sans), Montserrat (heading)
- **Custom Colors**: AI accent colors (`ai-light`, `ai`, `ai-dark`)
- **Custom Animations**: `pulse-slow`, `float`
- Uses CSS variables for theming (HSL color system)

## Important Notes

### Adding New Routes

Always add new routes in `App.tsx` ABOVE the `*` catch-all route. The comment in the file reminds you of this:
```typescript
{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
<Route path="*" element={<NotFound />} />
```

### Supabase Files

Files in `src/integrations/supabase/` may be auto-generated. Check file headers before editing. The `client.ts` file is marked as auto-generated.

### Development Server

Vite dev server is configured to:
- Run on port 8080
- Listen on all network interfaces (`::`)
- Use SWC for fast React refresh

### Component Tagger

The `lovable-tagger` plugin is only active in development mode (`npm run dev` or `npm run build:dev`).
