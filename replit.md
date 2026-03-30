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

## Feature List

### Core Features
- **POS (Point of Sale)** — full cart, multi-product, all 4 TZ mobile money + cash
- **Inventory Management** — stock tracking, low stock alerts
- **Cashbook / Transactions** — income/expense, payment methods, date filtering
- **Customers & Suppliers** — records, debt tracking, WhatsApp follow-up
- **Team/Staff Management** — staff records

### Business Tools (Tabs)
- **Akili AI Advisor** — context-aware AI chat using real weekly revenue/profit data
- **Invoices** — create, manage, and send invoices
- **Business Academy** — training content
- **Registration Hub** — BRELA/TIN/EFD registration guidance
- **EFD Z-Report** — daily Z-report generator with TRA transmission simulation
- **Mobile Money Ledger** — reconcile M-Pesa/Airtel/Tigo/HaloPesa against POS sales; uses real transactions when available, sample when not
- **👥 Payroll Calculator** — Tanzania statutory deductions: NSSF (10%+10%), NHIF (3%+3%), PAYE (progressive brackets), SDL (4%), WCF; generates monthly remittance schedule

### Dashboard Compliance Section
- **📡 VAT Guardian** — live 18% VAT tracking, TSh 100M registration threshold warning with progress bar, input tax credits, net VAT owing, monthly return countdown
- **📅 TRA Compliance Calendar** — deadline tracker for EFD Z-Report (daily), PAYE+SDL (7th), NSSF+NHIF (15th), VAT return (20th), annual income tax, WCF; urgency-coded with TRA portal links

### Credit & Loans
- **SME Credit Score** — computed from real transaction data: sales consistency, debt repayment, record keeping, transaction volume, customer base; CRDB/NMB/Pesapal loan eligibility

### Data Hooks
- Business profile stored in localStorage (`creova_business_profile`) via `useBusinessProfile.ts`
- `useTransactions`, `useProducts`, `useCustomers`, `useSuppliers` — TanStack Query with 30s stale time
- Onboarding wizard triggers on first launch when `profile.onboarded !== true`

### Tanzania Tax Rates (2024–2025)
- VAT: 18%, threshold TSh 100,000,000/year
- NSSF: 10% employee + 10% employer
- NHIF: 3% employee + 3% employer  
- SDL: 4% of gross (employer)
- WCF: ~0.5% (employer)
- PAYE brackets: 0–270K=0%, 270K–520K=9%, 520K–760K=20%, 760K–1M=25%, >1M=30%
