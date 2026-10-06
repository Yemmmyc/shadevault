# ShadeVault — Premium Sunglasses E-Commerce Store

[![Next.js](https://img.shields.io/badge/Next.js-16.3.8-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%26_Auth-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Mailgun](https://img.shields.io/badge/Mailgun-Transactional_Email-FA4336?style=flat-square&logo=mailgun)](https://www.mailgun.com/)

**ShadeVault** is a modern, responsive e-commerce web application for luxury sunglasses. Built with Next.js App Router, React, TypeScript, and Tailwind CSS, the application features full shopping cart management, server-validated checkout, persistent order database storage in Supabase PostgreSQL, Google OAuth authentication, authenticated order history, and transactional order confirmation emails via Mailgun.

Production Deployment URL: [https://shadevault.vercel.app](https://shadevault.vercel.app)

---

## 1. Project Overview

ShadeVault delivers a high-end online shopping experience for luxury eyewear. Designed with a dark glassmorphism aesthetic and responsive UI layout, ShadeVault ensures security and data integrity by enforcing server-side price and stock validation during checkout, keeping sensitive API keys off the client, and protecting user privacy using Supabase Row Level Security (RLS).

* **Core Stack:** Next.js (App Router), React, TypeScript, and Tailwind CSS.
* **Database & Auth:** Supabase PostgreSQL and Supabase Auth with Google OAuth.
* **Transactional Email:** Mailgun API integration for sending HTML order confirmation receipts.
* **Deployment Platform:** Vercel.

---

## 2. Current Functionality

- **Product Catalogue & Details:** Browse curated sunglasses with category filtering, keyword search, price sorting, and individual detail pages (`/products/[id]`).
- **Shopping Cart:** Interactive cart context with real-time quantity controls, subtotal previews, and local persistence.
- **Checkout Flow:** Server-Action backed checkout (`createOrderServerAction`) collecting shipping details and executing server-side order calculation and storage.
- **Server-Side Validation:** Product existence, prices, tax (8%), and totals are calculated and validated strictly on the server—client-supplied prices are never trusted.
- **Persistent Orders:** Orders (`public.orders`) and line items (`public.order_items`) are stored in Supabase PostgreSQL with UUID database IDs (`id`) and customer-facing order numbers (`order_number`).
- **Authenticated Order History:** User-specific dashboard (`/orders`) retrieving persisted orders directly from Supabase for authenticated users across login sessions.
- **Google Sign-In:** One-click OAuth 2.0 single sign-on powered by Supabase Auth.
- **Mailgun Order Confirmations:** Instant dispatch of formatted HTML order receipts upon successful checkout.

---

## 3. Order Persistence

Orders in ShadeVault are stored directly in Supabase PostgreSQL (`public.orders` and `public.order_items`) and linked to the authenticated user's ID (`user_id`). 

Order history is persisted securely on the database rather than relying on browser localStorage. When customers log out, close their browser, and log back in, their previous order history is retrieved automatically via Supabase Row Level Security policies.

- `public.orders.id` stores a unique UUID (`databaseOrderId`) for relational data integrity.
- `public.orders.order_number` stores the customer-facing identifier (`ORD-2026-XXXX`).
- `public.order_items` stores individual purchased products linked via `order_id` (UUID foreign key) and `unit_price`.

---

## 4. Email Integration (Mailgun)

ShadeVault dispatches rich HTML and plain-text order confirmation receipts via the server-side Mailgun REST API.

- **Sandbox Testing Configuration:** The current development setup utilizes a Mailgun sandbox domain (`MAILGUN_DOMAIN`).
- **Authorized Recipients:** When using a Mailgun sandbox domain, recipient email addresses must be explicitly authorized in the Mailgun Dashboard before emails can be delivered.
- **Production Status:** Local delivery to authorized Gmail recipients has been successfully verified. Unrestricted email delivery to arbitrary customer email addresses will require a verified custom domain on a paid or custom Mailgun account.

---

## 5. Environment Variables Configuration

Configure the required environment variables locally in `.env.local` or in the Vercel project environment settings:

```env
# Public Supabase Credentials (Exposed to Browser)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# Private Server-Only Credentials (NEVER expose to browser / NEVER commit to Git)
MAILGUN_API_KEY
MAILGUN_DOMAIN
MAILGUN_FROM_EMAIL
```

> **Security Note:** Secret keys (such as `MAILGUN_API_KEY`) must **never** be committed to Git repositories or prefixed with `NEXT_PUBLIC_`.

---

## 6. Google OAuth Configuration

Authentication is powered by Supabase Auth with Google OAuth 2.0.

To support authentication in both local and production environments:
1. **Google Cloud Console:** Add the production callback URL (`https://shadevault.vercel.app/auth/callback`) and local callback URL (`http://localhost:3000/auth/callback`) under *Authorized Redirect URIs*.
2. **Supabase Auth Dashboard:** Configure the *Site URL* and *Additional Redirect URLs* to match the Vercel production domain and local server.

---

## 7. Supabase Database Configuration & Security

ShadeVault relies on three primary tables in the `public` schema:
- `public.products`: Catalog items, pricing, images, categories, and stock counts.
- `public.orders`: High-level purchase records, totals, shipping address, status (`processing`), and owner `user_id`.
- `public.order_items`: Purchased line items linking `order_id` (UUID) to `product_id`, `quantity`, and `unit_price`.

### Row Level Security (RLS)
- `products`: Public `SELECT` access enabled for all users (`anon` and `authenticated`).
- `orders` & `order_items`: `SELECT` policies restricted strictly to the matching authenticated session (`auth.uid() = user_id`), ensuring users can only view their own purchase records.

---

## 8. Local Verification Completed

The following checks and user workflows have been fully tested and verified locally:

- [x] **TypeScript Type Checking:** Executed `npx tsc --noEmit` with 0 errors.
- [x] **Production Build Compilation:** Executed `npm run build` with 0 errors and verified static/dynamic route bundle output.
- [x] **Supabase Order Creation:** Validated server action order creation in `public.orders` and line items in `public.order_items`.
- [x] **Supabase Order History Retrieval:** Verified order history fetching from Supabase for authenticated users.
- [x] **Mailgun Confirmation Email Delivery:** Verified email receipt delivery to an authorized Gmail recipient via Mailgun sandbox API.
- [x] **HTML Email Formatting:** Confirmed receipt layout, itemized table formatting, and totals calculation in delivered HTML email.

---

## 9. Production Deployment

- **Production URL:** [https://shadevault.vercel.app](https://shadevault.vercel.app)
- **Status:** Deployment target prepared for Vercel. **Note:** Full end-to-end testing on the live Vercel production deployment remains pending until the latest changes are pushed and deployed.

---

## 10. Security Notes

- **Zero Secrets in Git:** `.env` and `.env.local` files are strictly excluded via `.gitignore`.
- **Server-Only Credentials:** Private keys like `MAILGUN_API_KEY` are isolated to Server Actions (`'use server'`) and never exposed to the client bundle.
- **Server-Side Validation:** All order calculations and prices are computed authoritatively on the server to prevent client-side price manipulation.
- **Row Level Security (RLS):** Supabase database access policies protect customer order privacy.

---

## 11. Author

**Oluwayemisi Okunrounmu**  
IT Professional / Cloud & DevOps Practitioner  
GitHub: [@Yemmmyc](https://github.com/Yemmmyc)
