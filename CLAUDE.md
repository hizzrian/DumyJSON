# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JSON Mock API - A self-hosted mock JSON REST API service for testing and prototyping, similar to dummyjson.com. Built with Next.js 16 (App Router) and React 19.

## Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16.2.4 (App Router)
- **UI**: React 19 with Tailwind CSS v4
- **Database**: Supabase (PostgreSQL) for custom endpoint storage
- **Language**: TypeScript (strict mode)

### Directory Structure
```
app/
  ├── admin/              # Admin dashboard for managing custom endpoints
  ├── api/
  │   ├── custom/[...path]/  # Catch-all route for user-defined endpoints
  │   ├── [resource]/        # Pre-built mock endpoints (users, products, posts, etc.)
  │   └── [resource]/[id]/   # Single-resource endpoints with field selection
  ├── layout.tsx
  └── page.tsx            # Landing page with API documentation
lib/
  ├── mockData.ts         # Mock data generators (100 users, 100 products, etc.)
  └── supabase.ts         # Supabase client initialization
```

### Key Patterns

**Pre-built Endpoints** (`/api/users`, `/api/products`, etc.):
- Return mock data from `lib/mockData.ts`
- Support query params: `limit`, `skip`, `select`, plus resource-specific filters
- Single-resource routes (`/api/users/:id`) support `select` for field filtering

**Custom Endpoints** (`/api/custom/*`):
- Stored in Supabase `endpoints` table
- Support template variables: `{{now}}`, `{{body}}`, `{{method}}`, `{{path}}`, `{{query.paramName}}`
- Configurable delay, status code, headers, and response templates
- Hit tracking logged to `endpoint_hits` table

**Database Schema** (`supabase-schema.sql`):
- `endpoints` - Custom endpoint definitions
- `endpoint_hits` - Request/response logging

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key

## Development Notes

- Uses Next.js 16 App Router conventions (route handlers, server components)
- ESLint config extends `eslint-config-next` with TypeScript support
- Path alias `@/*` maps to project root
- Tailwind CSS v4 uses new configuration format (no `tailwind.config.js`)
