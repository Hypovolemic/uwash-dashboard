# UWash Dashboard

UWash Dashboard is a mobile-first laundry status dashboard for UTown residences.
It visualizes machine status, queue information, and analytics, and is designed to run both as a web app and a Telegram Mini App.

## Live Deployment

- Production URL: `https://uwash-dashboard.vercel.app`

## Features

- Live status cards for washers and dryers
- Registered vs hardware-detected (unregistered) machine sessions
- Idle alert banner for laundry collection reminders
- Queue bottom sheet with waiting positions and estimated wait times
- Analytics bottom sheet with peak-hour chart and impact metrics
- Telegram Mini App initialization for in-app launch support

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Telegram WebApp SDK (`@twa-dev/sdk`)

## Local Development

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Telegram Mini App Notes

The app includes Telegram WebApp bootstrap logic in `src/main.tsx` and script loading in `index.html`.

If setting up with BotFather:

1. Create/configure your bot
2. Set Web App URL to `https://uwash-dashboard.vercel.app`
3. Add a menu button pointing to the same URL

## Deployment (Vercel)

This project is deployed on Vercel.

Typical deploy flow:

```bash
npm run build
npx vercel --prod
```

Note: `.vercel` is ignored in `.gitignore` and should not be committed.

## Project Structure

```text
src/
  components/      UI components (cards, sheets, header, strips)
  context/         College/house state management
  data/mock/       Mock API-shaped data for status/queue/analytics
  hooks/           Reusable hooks (e.g. useTick)
  types/           Shared API/data types
```

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - type-check and build production bundle
- `npm run preview` - preview built app locally
- `npm run lint` - run ESLint
