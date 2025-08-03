# Project: Inventory Management System

## Overview
This is a Next.js application for tracking inventory. It uses a feature-sliced architecture, with distinct sections for items, transactions, and settings.

## Key Technologies
- **Framework:** Next.js (App Router)
- **Backend:** Supabase (indicated by `app/_lib/server/supabase.js`)
- **UI Components:** A mix of custom components and shadcn/ui, located in `app/_components`.
- **State Management:**
  - **Server State:** React Query (indicated by `QueryProvider.js`).
  - **Client State:** A custom store, likely Zustand or similar, in `app/_store/appStore.js`.
- **Validation:** Zod (indicated by `app/_lib/ZodSchemas.js`).

## Architectural Notes
- **Component Structure:** Components are separated into client and server components within `app/_components`. Reusable, low-level UI components are in `app/_components/_ui`.
- **Server Logic:** Server-side operations are handled by Next.js Server Actions in `app/_lib/server/actions.js` and data services in `app/_lib/server/dataServices.js`.
- **API:** A REST API exists under `app/api/v1`.
- **Custom Hooks:** Custom hooks are located in `app/_hooks`.

## Coding Conventions
- **Validation:** Use the schemas defined in `app/_lib/ZodSchemas.js` for all data validation.
- **Forms:** When creating new forms, try to reuse the generic `Form.js` component found in `app/_components/_ui/client`.
- **Tables:** Leverage the generic `Table.js` component for data display.
- **Styling:** Global styles are in `app/_styles/globals.css`. PostCSS is also configured.
