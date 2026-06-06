# EduraPay Frontend

Marketing site and web app for EduraPay — fee collection, institute dashboards, and student portal.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS
- React Router, TanStack Query, Zustand
- EmailJS (demo / contact form — no backend required)

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_EMAILJS_SERVICE_ID` | Demo form | EmailJS service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | Demo form | EmailJS template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | Demo form | EmailJS public key |
| `VITE_API_BASE_URL` | App login | Backend API URL |

See `.env.example` for a template.

## Production build

```bash
npm run build
npm run preview
```

## Deploy on Vercel

1. Import this repository in [Vercel](https://vercel.com).
2. Framework: **Vite** (auto-detected).
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables from `.env.example`.
6. Deploy.

See [VERCEL.md](./VERCEL.md) for EmailJS template setup and verification steps.

## Routes

| Path | Description |
|------|-------------|
| `/` | Home |
| `/contact` | Demo request form |
| `/about` | About page |
| `/login` | Institute / admin login (requires API) |

`/pricing` redirects to `/contact`.
