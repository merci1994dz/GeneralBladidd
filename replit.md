# Arabic TV Streaming App

## Overview

This is a full-stack Arabic TV streaming application built with React on the frontend and Express.js on the backend. The app provides a comprehensive platform for streaming Arabic channels with categorized content, admin management, and a responsive Arabic-first user interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Arabic TV theme
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Style**: RESTful APIs with JSON responses
- **Development**: Hot reload with Vite middleware integration

## Key Components

### Database Schema
The application uses two main tables:
- **Channels**: Stores TV channel information (name, URL, category, description, logo, status)
- **Users**: User management for admin authentication
- **Categories**: Predefined categories (sports, news, algerian, kids, entertainment, religious, documentary)

### Frontend Components
- **WelcomeScreen**: Animated entry screen with Arabic branding
- **VideoPlayer**: Custom video player with controls and loading states
- **CategoryTabs**: Channel filtering by category
- **ChannelCard**: Individual channel display with favorite functionality
- **AdminPanel**: Administrative interface for channel management

### Backend Services
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **Route Handlers**: CRUD operations for channels and users
- **API Endpoints**: RESTful endpoints for channel management

## Data Flow

1. **Channel Loading**: Frontend fetches channels from `/api/channels` endpoint
2. **Category Filtering**: Client-side filtering based on selected category
3. **Channel Playback**: Video player component handles stream URLs
4. **Admin Operations**: CRUD operations through protected admin routes
5. **Real-time Updates**: TanStack Query provides optimistic updates and caching

## External Dependencies

### Frontend Libraries
- React ecosystem (React, React-DOM, React Router via Wouter)
- UI Framework (Radix UI, Tailwind CSS, shadcn/ui)
- State Management (TanStack Query)
- Form Handling (React Hook Form, Zod validation)
- Utilities (date-fns, clsx, lucide-react icons)

### Backend Libraries
- Express.js server framework
- Drizzle ORM for database operations
- Neon Database serverless driver
- TypeScript for type safety
- Zod for schema validation

### Development Tools
- Vite for build tooling and development server
- TypeScript compiler
- ESBuild for production builds
- Replit-specific plugins for development environment

## Deployment Strategy

### Development Mode
- Uses Vite dev server with middleware integration
- Hot module replacement for frontend changes
- Express server with TypeScript compilation via tsx
- In-memory storage for development data

### Production Build
- Frontend: Vite builds React app to `dist/public`
- Backend: ESBuild compiles Express server to `dist/index.js`
- Database: Drizzle migrations applied to PostgreSQL
- Environment: Production Node.js server serves static files and API

### Environment Configuration
- Database URL configuration for PostgreSQL connection
- Separate development and production configurations
- Environment-specific logging and error handling

## Changelog

```
Changelog:
- July 07, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```