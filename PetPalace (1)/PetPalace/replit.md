# PetPal - Pet Care Management App

## Overview

PetPal is a full-stack web application for pet owners to manage their pets, find pet sitters, discover services, and engage with a social community. The application provides a comprehensive platform for pet care management with a modern, responsive interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The application uses a modern React-based frontend architecture with the following key decisions:

- **React with TypeScript**: Provides type safety and improved developer experience
- **Vite**: Fast build tool and development server for optimal development experience
- **Wouter**: Lightweight client-side routing instead of React Router for minimal bundle size
- **TanStack Query**: Handles server state management, caching, and data fetching with automatic background updates
- **Shadcn/ui + Tailwind CSS**: Component library built on Radix UI primitives with Tailwind for consistent, accessible UI components
- **Theme System**: Built-in dark/light mode support with context-based theme management

### Backend Architecture

The backend follows a REST API pattern with Express.js:

- **Express.js**: Node.js web framework for handling HTTP requests and middleware
- **TypeScript**: Type safety across the entire backend codebase
- **Modular Route Organization**: Routes are organized by feature in a dedicated routes file
- **Storage Layer Abstraction**: Interface-based storage layer for easy testing and potential database swapping

### Data Storage

- **PostgreSQL**: Primary database using Drizzle ORM for type-safe database operations
- **Drizzle ORM**: Schema-first ORM with excellent TypeScript integration
- **Database Migrations**: Managed through Drizzle Kit for version control of schema changes
- **Database Implementation**: Replaced in-memory storage with DatabaseStorage class using Drizzle queries
- **Data Seeding**: Database populated with sample users, pets, sitters, services, and social posts

### Key Components

1. **Pet Management**: CRUD operations for pet profiles with health tracking
2. **Pet Sitter Discovery**: Browse and filter available pet sitters with ratings and pricing
3. **Service Directory**: Find pet stores, trainers, and grooming services
4. **Social Feed**: Community features with posts, comments, and likes
5. **User Profiles**: Comprehensive user management with emergency contacts

### Data Flow

1. **Client-Side**: React components use TanStack Query for data fetching
2. **API Layer**: Express routes validate requests and interact with storage
3. **Storage Layer**: Abstracted interface allows for flexible data persistence
4. **Database**: PostgreSQL stores all application data with typed schema

### External Dependencies

- **Neon Database**: Serverless PostgreSQL hosting via `@neondatabase/serverless`
- **Radix UI**: Accessible component primitives for consistent UI
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form handling with validation

### Authentication Strategy

The application currently uses a simplified user system with hardcoded user IDs ("user-1") for development. This suggests the authentication system is planned but not yet implemented.

### Deployment Strategy

- **Development**: Vite dev server with hot reload and Express backend
- **Production**: Static assets served by Express with API routes
- **Build Process**: Vite builds the frontend, esbuild bundles the backend
- **Database**: Managed PostgreSQL instance with connection pooling

### Schema Design

The database schema supports:
- **Users**: Complete profile management with emergency contacts
- **Pets**: Pet profiles with health tracking and appointments
- **Pet Sitters**: Service provider profiles with ratings and availability
- **Services**: Business listings for pet-related services
- **Social Features**: Posts, comments, and likes for community engagement

### Error Handling

- **Client-Side**: TanStack Query handles loading states and error boundaries
- **Server-Side**: Express error middleware with proper HTTP status codes
- **Validation**: Zod schemas ensure data integrity at API boundaries

### Performance Considerations

- **Code Splitting**: Vite handles automatic code splitting for optimal loading
- **Caching**: TanStack Query provides intelligent caching and background updates
- **Database**: Drizzle ORM generates efficient queries with proper indexing support
- **Static Assets**: Optimized build process with asset optimization