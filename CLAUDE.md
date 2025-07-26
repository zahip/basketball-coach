# Basketball Coach App - Development Instructions

## Quick Start

- Run `pnpm dev` to start the development server
- App runs at http://localhost:3000 (or next available port)

## Tech Stack

- Next.js 15.3.3
- TypeScript
- Tailwind CSS
- Shadcn
- Prisma ORM
- Supabase (authentication)
- tRPC
- next-intl

## Key Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm start` - Start production server
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - React components
- `/src/lib` - Utilities and configurations
- `/prisma` - Database schema and migrations
- `/messages` - i18n translation files

## Database

- Uses Prisma with migrations
- Run `npx prisma generate` to update client
- Run `npx prisma db push` to sync schema

## Authentication

- Supabase authentication integrated
- Auth pages at `/auth` and `/[locale]/auth`
- Dashboard at `/[locale]/dashboard`


## Internationalization (i18n)
- **ALWAYS** use next-intl for all user-facing text
- **NEVER** hardcode strings in components
- Use `useTranslations()` hook in components
- Use `getTranslations()` in server components
- All text must be defined in `/messages/[locale].json`
- Default locale is [your default locale]
- Supported locales: [list your locales]

### Translation Requirements
- Every new feature MUST include translations
- Every text string MUST use translation keys
- Example: `t('dashboard.welcome')` not `"Welcome"`


