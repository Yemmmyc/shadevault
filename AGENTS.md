# Project Purpose

ShadeVault is a responsive sunglasses e-commerce website.

Customers should be able to:
- Browse sunglasses
- View product details
- Add products to a cart
- Sign in with Google
- Proceed through checkout
- Have orders saved to Supabase
- Receive order confirmation emails through Mailgun
- View their previous orders

# Technology Stack

Planned stack:
- Next.js with App Router
- React
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL database
- Supabase Authentication
- Google OAuth through Supabase Auth
- Mailgun for transactional email
- Vercel for deployment
- GitHub for source control

# Architecture Principles

- Use TypeScript throughout.
- Use Server Components by default.
- Use Client Components only where browser interactivity is required.
- Keep server-only functionality on the server.
- Keep database access isolated from presentation components.
- Use reusable components.
- Keep business logic separate from UI where practical.
- Prefer simple, maintainable solutions over unnecessary abstractions.
- Avoid unnecessary dependencies.

# Authentication

- Google authentication will be implemented through Supabase Auth.
- Never expose service-role keys or private credentials to the browser.
- Authentication-related server operations must be handled securely.
- Users must only be able to access their own order history.

# Database

Supabase PostgreSQL will store:
- Products
- Orders
- Order items
- Customer/user relationships where required

Database operations must use secure access patterns.
Do not hard-code database credentials.

# Checkout

The checkout flow must:
1. Validate the cart.
2. Require authentication where appropriate.
3. Calculate totals on the server.
4. Create the order in Supabase.
5. Create the order items.
6. Send a confirmation email through Mailgun.
7. Show the customer a confirmation state.

Do not trust prices or totals supplied directly by the browser.

# Mailgun

- Mailgun credentials must remain server-side.
- Never expose a Mailgun API key in client-side code.
- Never commit secrets to Git.
- Email sending should happen through a secure server-side route or server action.

# Environment Variables

Use environment variables for secrets and configuration.

Expected variables will include appropriate values for:
- Supabase URL
- Supabase publishable/anon key as appropriate
- Supabase server/service credentials where required
- Google OAuth configuration where required
- Mailgun API key
- Mailgun domain/sender configuration

Never commit .env files or secrets.

# UI/UX

The website should have a polished modern sunglasses-store aesthetic.

Requirements:
- Responsive desktop, tablet, and mobile layouts.
- Accessible controls.
- Clear navigation.
- Product cards with images, names, prices, and actions.
- Clear cart state.
- Clear checkout experience.
- Clear loading, success, and error states.
- Keyboard-accessible interactions.
- Do not sacrifice usability for visual effects.

# Product Catalogue

The initial demonstration catalogue can contain approximately 8 sunglasses products.

Use realistic demo product information and clearly treat prices as demonstration data unless otherwise specified.

# Required Pages

Plan for:

/
/products
/products/[id]
/cart
/checkout
/orders
/login

The exact routing structure may be adjusted if a better Next.js architecture is justified.

# Security Rules

- Never hard-code secrets.
- Never expose service-role credentials to the client.
- Never commit .env files.
- Never trust client-supplied prices or totals.
- Validate user input on the server.
- Validate product existence and availability on the server.
- Protect customer order data.
- Do not weaken security checks simply to make development easier.

# AI Agent Workflow

Before making changes:
1. Read AGENTS.md.
2. Inspect the existing project.
3. Understand the relevant architecture.
4. Make the smallest appropriate change.
5. Explain important implementation decisions.
6. Run appropriate validation.
7. Fix errors before considering the task complete.

Do not rewrite working functionality unnecessarily.

Do not install new dependencies unless they are actually required.

When an external service requires manual configuration, such as Supabase, Google Cloud Console, or Mailgun, explain the exact manual steps rather than pretending the agent can perform them.

# Testing Requirements

The application must eventually be tested for:

- Product browsing
- Product details
- Add to cart
- Cart quantity changes
- Cart removal
- Google sign-in/sign-out
- Checkout validation
- Order creation
- Order persistence in Supabase
- Order history
- Confirmation email delivery
- Unauthorized access protection
- Responsive layout
- Production build

# Development Quality

Before considering the project complete:
- npm run build must pass.
- TypeScript must have no errors.
- No obvious runtime errors.
- No unnecessary console errors.
- Core user flows must be manually tested.
- Production configuration must not contain exposed secrets.
