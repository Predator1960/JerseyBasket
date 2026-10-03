# Instructions for AI coding assistants

Read `HANDOVER.md` in the repository root first. It explains what JerseyBasket
is, how the catalog and advertiser slides work, how it deploys, and the
Windows/OneDrive problems to expect.

Short version:
- Create React App; almost all code is `src/App.jsx` (about 13,700 lines).
- The product catalog (`BASE_PRODUCTS`) is data inside that file. New and
  changed products use the modern price format with an `upd` date.
- Pushing to `main` deploys to Vercel.
- After catalog changes, regenerate `product-full-export.csv` and run
  `sync_products.py`.
- The owner is not a programmer. Explain in plain English, do the work
  yourself, test it, and ask before anything risky or public.
- Never invent prices, and never commit secrets.
