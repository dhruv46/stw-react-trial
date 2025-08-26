# Trading UI Starter (React + Vite + Tailwind)

A clean, production‑ready UI scaffold inspired by popular Indian broker platforms. It includes:

- Responsive shell with Topbar + collapsible Sidebar
- Routing for common pages (Dashboard, Orders, Holdings, Positions, Funds, Watchlists, Markets, Profile, OrderPad)
- Tailwind CSS theming and dark mode toggle
- Mock data & components (watchlist, tickertape, tables) you can replace with real APIs
- Accessible controls and mobile‑friendly layouts

> ⚠️ This project **only** includes UI & navigation. Hook your own backend/order APIs, websockets, and charting libraries.

## Quick Start

```bash
# 1) Extract and enter
npm install
npm run dev
```

Open http://localhost:5173

## File Highlights

- `src/layouts/Shell.tsx` – overall layout
- `src/components/Topbar.tsx` – search, theme toggle
- `src/components/Sidebar.tsx` – nav & CTA (New Order)
- `src/pages/*` – individual screens
- `src/mock/data.ts` – sample data to visualize the UI

## Tailwind

Configured in `tailwind.config.js`. Global utilities in `src/index.css`.

## Next Steps

- Replace mock data with live market feeds.
- Wire OrderPad to your order placement API.
- Drop in your charting lib (TV Lightweight Charts, Chart.js, etc.) on `Markets`.
- Add auth (e.g., login/2FA), profile KYC, and settings.
- Set up a design system for states (pending/complete/rejected) and error toasts.