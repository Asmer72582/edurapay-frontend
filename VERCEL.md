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
