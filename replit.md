# Dar SME (CREOVA) - Business Management Platform

## Project Overview
A comprehensive business management platform for Small and Medium Enterprises (SMEs) in East Africa (Tanzania). Features POS, inventory management, financial tracking, and compliance tools (M-Pesa, TRA/EFD compliance).

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4 + Radix UI (shadcn/ui pattern)
- **Routing**: React Router 7
- **State/Data**: TanStack Query (React Query)
- **Backend/DB**: Supabase (Edge Functions + PostgreSQL)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React + MUI Icons

## Project Structure
- `/src/app/components` - UI components (generic `/ui` and domain-specific)
- `/src/app/pages` - Page-level components (Dashboard, POS, Inventory, etc.)
- `/src/app/hooks` - Custom React hooks
- `/src/app/lib` - API clients and utilities
- `/src/styles` - Global CSS and Tailwind config
- `/supabase` - Supabase Edge Functions
- `/utils` - Supabase utility functions

## Development Setup
- **Package Manager**: npm
- **Dev Server**: `npm run dev` → runs on port 5000
- **Host**: 0.0.0.0 (required for Replit proxy)
- **Build**: `npm run build` → outputs to `/dist`

## Deployment
- **Type**: Static site
- **Build command**: `npm run build`
- **Public directory**: `dist`

## Key Notes
- React and react-dom are explicitly installed even though listed as peerDependencies in package.json
- Vite configured with `allowedHosts: true` and `host: '0.0.0.0'` for Replit compatibility
