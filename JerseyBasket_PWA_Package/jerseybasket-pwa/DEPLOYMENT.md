# 🛍️ JerseyBasket – Deployment Guide

## What's in this package

| File | Purpose |
|------|---------|
| `public/index.html` | HTML shell with PWA meta tags, iOS support, splash screen |
| `public/manifest.json` | Makes the app installable on Android & iOS |
| `public/service-worker.js` | Offline support, caching, push notifications |
| `src/App.jsx` | The main React app (copy jersey-grocery-app.jsx here) |
| `package.json` | Node dependencies |
| `vercel.json` | One-click Vercel deployment config |

---

## 🚀 Deploy in 15 minutes (FREE)

### Step 1 — Set up your project

```bash
# Install Node.js from https://nodejs.org if you don't have it
# Then run:
npx create-react-app jerseybasket
cd jerseybasket

# Replace src/App.js with the jersey-grocery-app.jsx file
# Replace public/index.html with the provided index.html
# Add manifest.json and service-worker.js to public/
```

### Step 2 — Register the service worker in src/index.js

Add this line to `src/index.js`:
```javascript
import './registerSW';
```

Create `src/registerSW.js`:
```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
```

### Step 3 — Deploy to Vercel (free hosting)

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy (takes ~2 minutes)
npm run build
vercel --prod

# Follow the prompts — it'll give you a live URL immediately
# e.g. https://jerseybasket.vercel.app
```

### Step 4 — Connect a custom domain (optional, ~£10/year)

1. Buy `jerseybasket.je` from Jersey Nominet (or `.com` / `.co.uk`)
2. In Vercel dashboard → Settings → Domains → Add `jerseybasket.je`
3. Point your domain's DNS to Vercel (they give you exact instructions)
4. HTTPS is automatic and free

---

## 📱 How users install it

### Android (Chrome)
1. Visit the site in Chrome
2. Chrome shows "Add to Home Screen" banner automatically
3. Or: tap the 3-dot menu → "Add to Home Screen"
4. App appears on home screen like a native app

### iPhone / iPad (Safari)
1. Visit the site in Safari
2. Tap the Share button (box with arrow)
3. Scroll down → tap "Add to Home Screen"
4. App appears on home screen like a native app

### Desktop (Chrome / Edge)
1. Visit the site
2. Click the install icon in the address bar (looks like a monitor with ↓)
3. App opens in its own window

---

## 💰 Adding Payments (Stripe)

To charge for the app (subscription or one-time):

```bash
npm install @stripe/stripe-js
```

1. Create account at stripe.com
2. Add a £2.99/month product in Stripe dashboard
3. Wrap the app in a `<PaywallGate>` component that checks for active subscription
4. Redirect non-paying users to Stripe Checkout

Jersey is not in the UK for VAT purposes — you don't charge VAT on digital services
sold to Jersey residents. Get advice from a local accountant.

---

## 🔧 Keeping Prices Updated

Currently prices are hardcoded. For a commercial product, consider:

**Option A — Google Sheets (easiest)**
- Maintain prices in a Google Sheet
- Use Google Sheets API to fetch on app load
- Free, easy to update from phone

**Option B — Supabase (recommended)**
- Free tier: 500MB database
- Build a simple admin page to update prices
- Users can submit price corrections

**Option C — Crowdsource**
- Add "Report a price" button to each card
- Users submit corrections
- You review and approve via an admin panel

---

## 📊 Analytics (free)

Add to index.html before `</head>`:
```html
<!-- Plausible (privacy-friendly, GDPR compliant, free tier) -->
<script defer data-domain="jerseybasket.je"
  src="https://plausible.io/js/script.js"></script>
```

This shows you: daily users, most viewed products, which stores are most popular.

---

## 🔔 Push Notifications (price alerts)

The service worker already supports push notifications.
To activate:
1. Use [web-push](https://www.npmjs.com/package/web-push) on a Node.js backend
2. Ask users to subscribe when they add items to basket
3. Send alerts when prices drop on their saved items

---

## 📦 Full Native App (App Store / Google Play)

When ready to go native:

```bash
npm install -g @capacitor/cli
npx cap init JerseyBasket je.jerseybasket
npm install @capacitor/android @capacitor/ios
npm run build
npx cap add android
npx cap add ios
npx cap sync
npx cap open android   # Opens in Android Studio
npx cap open ios       # Opens in Xcode (Mac required)
```

Cost to publish:
- Google Play: £20 one-time
- Apple App Store: £79/year (requires Mac or Mac-in-cloud service)

---

## 🗂 Folder Structure

```
jerseybasket/
├── public/
│   ├── index.html          ← PWA shell (provided)
│   ├── manifest.json       ← Install config (provided)
│   ├── service-worker.js   ← Offline support (provided)
│   └── icons/
│       ├── icon-72.png     ← Generate from logo
│       ├── icon-96.png
│       ├── icon-128.png
│       ├── icon-192.png    ← Main app icon
│       └── icon-512.png    ← Splash / store listing
├── src/
│   ├── index.js
│   ├── registerSW.js
│   └── App.jsx             ← jersey-grocery-app.jsx goes here
├── package.json
└── vercel.json
```

---

## 🎨 Creating App Icons

You need icons in 5 sizes. Easiest free options:

1. **Canva** (canva.com) — make a 1024×1024 PNG with your logo
2. **PWA Asset Generator**: `npx pwa-asset-generator logo.png ./public/icons`
   This auto-generates all sizes including iOS splash screens.

Suggested icon: dark navy background (#050d1a), shopping basket emoji or custom "JB" monogram in green (#22c55e).

---

## ✅ Pre-launch Checklist

- [ ] App loads on iPhone Safari
- [ ] App loads on Android Chrome
- [ ] "Add to Home Screen" works on both
- [ ] App works offline (turn on airplane mode — basket should still load)
- [ ] All 5 stores show correct prices
- [ ] Custom item add works
- [ ] Basket total calculates correctly
- [ ] Domain purchased and connected
- [ ] Privacy policy page added (required for App Store)
- [ ] Contact/feedback email set up

---

*JerseyBasket v2.0 — Built for Jersey, Channel Islands*
