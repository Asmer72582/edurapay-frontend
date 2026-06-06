# Deploying EduraPay frontend on Vercel

## 1. Vercel project setup

1. Import the repository in [Vercel](https://vercel.com).
2. Framework preset: **Vite** (auto-detected).
3. Build command: `npm run build`
4. Output directory: `dist`

## 2. Environment variables (Vercel)

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_EMAILJS_SERVICE_ID` | Yes (demo form) | EmailJS service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | Yes (demo form) | EmailJS template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | Yes (demo form) | EmailJS public key |
| `VITE_SITE_URL` | SEO | Public site URL (e.g. `https://www.edurapay.in`) — canonical links & Open Graph |
| `VITE_API_BASE_URL` | For app login | Backend API URL (e.g. `https://api.edurapay.in/api`) |

The **demo / contact form uses EmailJS only** — no backend API call.

### EmailJS template setup

1. Sign up at [emailjs.com](https://www.emailjs.com).
2. Create an **Email Service** (Gmail, Outlook, etc.) connected to `support@edurapay.com`.
3. Create a **Template** with these variables in the body:

   - `{{from_name}}`
   - `{{from_email}}`
   - `{{reply_to}}`
   - `{{phone}}`
   - `{{institute}}`
   - `{{subject}}`
   - `{{message}}`
   - `{{request_type}}`

4. Copy Service ID, Template ID, and Public Key into Vercel env vars.
5. Redeploy after adding variables.

## 3. Verify demo form

1. Open `/contact` on your Vercel URL.
2. Submit **Request demo**.
3. Confirm success toast and check your inbox.

## 4. App login (not on marketing nav)

Institute staff can sign in at:

`https://your-app.vercel.app/login`

Requires `VITE_API_BASE_URL` pointing to your live API.

## 5. SEO checklist

1. Set `VITE_SITE_URL` to your production domain (e.g. `https://www.edurapay.in`).
2. In Vercel, set **both** `edurapay.in` and `www.edurapay.in` as custom domains. Apex (`edurapay.in`) redirects to `www` via `vercel.json`.
3. Submit `https://www.edurapay.in/sitemap.xml` in [Google Search Console](https://search.google.com/search-console).
4. Verify `robots.txt` at `https://www.edurapay.in/robots.txt` — it must contain `Allow: /` and only block `/app/`, `/login`, `/pay/`, and `/student-onboarding/`.
5. After deploy, test Open Graph with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or similar.
6. Point custom domain in Vercel and use the same URL in `VITE_SITE_URL`.

### Fix “No information is available” in Google Search

If Google shows your URL without a description and mentions **robots.txt**:

1. **Confirm the live file** — open `https://www.edurapay.in/robots.txt`. It should allow `/`. If it does, the block was likely from an older deploy; Google needs a fresh crawl.
2. **Use the www URL in Search Console** — add property `https://www.edurapay.in` (or the Domain property `edurapay.in`).
3. **Request indexing** — Search Console → URL Inspection → enter `https://www.edurapay.in/` → **Request indexing**.
4. **Submit sitemap** — Sitemaps → add `https://www.edurapay.in/sitemap.xml`.
5. **Optional cleanup** — for the old `http://edurapay.in/` result, use [Remove outdated content](https://search.google.com/search-console/remove-outdated-content) after redirects are live so Google drops the stale URL.

The homepage HTML includes a meta description; once Google recrawls, the snippet should appear within a few days.
