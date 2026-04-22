# ID-MAP — Indonesia Mangrove Mapping Application

## Overview
An ecological monitoring and data collection web application for field officers in Indonesia. Supports mangrove monitoring, planting recommendations, sea turtle monitoring, and coastal abrasion tracking with offline-first capabilities.

## Tech Stack
- **Frontend:** React 19 + TypeScript, Vite 8, Tailwind CSS, React Router
- **Mapping:** Leaflet + React Leaflet
- **Charts:** Recharts
- **Backend/Data:** Supabase (PostgreSQL + Auth + Realtime)
- **Offline Storage:** localStorage + offlineQueue system
- **Image/OCR:** Cloudinary, EmailJS, Tesseract.js, Exifr

## Project Structure
- `src/components/` — Reusable UI components (Layout, shared)
- `src/context/` — React Context providers (Auth, State)
- `src/data/` — Mock data, local storage handlers, constants
- `src/lib/` — Third-party clients (Supabase, Cloudinary, EmailJS) and utilities
- `src/pages/` — Application views (Dashboard, Map, InputLapangan, Laporan, etc.)
- `src/types/` — TypeScript interfaces
- `supabase/` — DB migrations and schema definitions
- `ocr-server/` — Python Flask OCR utility server (independent)

## Development
- **Package manager:** npm
- **Dev server:** `npm run dev` on port 5000
- **Build:** `npm run build` (tsc + vite build → `dist/`)

## Deployment
- **Type:** Static site
- **Build command:** `npm run build`
- **Public directory:** `dist`

## Environment Variables / Secrets
- Supabase URL and anon key (configured in `src/lib/supabase.ts`)
- Cloudinary credentials (configured in `src/lib/cloudinary.ts`)
- EmailJS credentials (configured in `src/lib/emailjs.ts`)
