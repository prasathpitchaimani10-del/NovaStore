# NovaStore - Full-Stack E-Commerce Platform

NovaStore is a full-stack, production-grade e-commerce application built with React, TypeScript, Tailwind CSS, Express, and MongoDB. The system enforces strict backend authoritative validation for all pricing, stock, tax, shipping, and discount rules.

---

## Key Architecture & Security Specifications

1. **Authoritative Backend Pricing & Calculations**:
   - The backend looks up product prices directly from the database and recalculates subtotal, shipping, taxes, and coupon discounts on every preview and order creation request.
   - Client-side modifications to prices or totals in payloads are strictly disregarded.

2. **Inventory Protection & Atomic Stock Management**:
   - Stock quantities are validated prior to order confirmation. If available inventory is insufficient, the transaction is rejected with an informative error.
   - Stock counts are decremented atomically upon confirmed order creation.

3. **Safe Idempotency & Duplicate Order Prevention**:
   - The checkout pipeline generates an idempotency key per checkout session. Resubmitted orders with the same idempotency key return the existing order rather than executing duplicate credit transactions or double-decrementing stock.

4. **Authentication & Role-Based Access Control (RBAC)**:
   - Passwords are encrypted with `bcrypt` (10 salt rounds) before persistence; plaintext credentials are never saved.
   - User authentication issues signed JWT bearer tokens (`Authorization: Bearer <token>`).
   - Customer data isolation ensures users can only access their own orders and profile records.
   - Dedicated administrative routes (`/api/products` [POST/PUT/DELETE], `/api/orders` [GET], `/api/orders/:id/status` [PATCH], `/api/coupons` [POST/DELETE]) require the `adminOnly` middleware (`req.user.role === 'admin'`).

5. **Verified-Purchase Customer Reviews**:
   - Reviews can only be submitted for a product if the authenticated user has a verified, delivered order containing that product ID in the database. Unverified review attempts are rejected with HTTP 403.

6. **Payment & Media Secret Separation**:
   - Payment secrets (`STRIPE_SECRET_KEY`) and Cloudinary secrets (`CLOUDINARY_API_SECRET`) remain exclusively on the backend server.
   - Payment intents and cryptographic upload signatures are generated server-side.
   - Raw credit card and CVV numbers are never stored in the database.

---

## Default Seeded Accounts

For testing and verification:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@novastore.com` | `AdminPass123!` |
| **Customer** | `customer@novastore.com` | `CustomerPass123!` |

Active promotional discount codes:
- `SAVE10`: 10% off orders over $50
- `WELCOME20`: 20% off orders over $100
- `FIXED25`: $25 off orders over $120

---

## Project Structure

```
├── server.ts                    # Full-stack server entry point (Express + Vite)
├── server/
│   ├── config/
│   │   └── db.ts                # MongoDB / Mongoose connection handler
│   ├── controllers/
│   │   ├── authController.ts    # Authentication, profiles, password updates
│   │   ├── couponController.ts  # Promo code validation and administration
│   │   ├── orderController.ts   # Authoritative checkout preview, stock decrement, orders
│   │   ├── paymentController.ts # Payment intent generation without card storage
│   │   ├── productController.ts # Catalog listing, filtering, search, and admin CRUD
│   │   ├── reviewController.ts  # Verified-purchase reviews verification and creation
│   │   └── uploadController.ts  # Signed Cloudinary parameters & image upload
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification and admin role protection
│   │   └── errorHandler.ts      # Standardized JSON error response handler
│   ├── models/
│   │   ├── Coupon.ts            # Mongoose Schema for promotional coupons
│   │   ├── Order.ts             # Mongoose Schema for orders and line items
│   │   ├── Product.ts           # Mongoose Schema for hardware catalog items
│   │   ├── Review.ts            # Mongoose Schema for verified customer reviews
│   │   └── User.ts              # Mongoose Schema for accounts with bcrypt pre-save hook
│   ├── routes/
│   │   └── api.ts               # Express router mapping all endpoints
│   └── services/
│       └── dbStore.ts           # Resilient storage provider with seed data and queries
├── src/
│   ├── components/              # Header, Footer, ProductCard, CartDrawer, AuthModal, StarRating
│   ├── context/                 # AuthContext, CartContext, NotificationContext
│   ├── pages/                   # HomePage, CatalogPage, ProductDetailPage, CheckoutPage, etc.
│   ├── services/
│   │   └── api.ts               # Typed client-side API layer matching all backend routes
│   ├── types/
│   │   └── index.ts             # Strict TypeScript definitions
│   ├── App.tsx                  # Main application routing and shell
│   └── main.tsx                 # React DOM mount point
├── .env.example                 # Environment configuration template
├── package.json
└── tsconfig.json
```

---

## Environment Variables

Configure the following values in your `.env` file (refer to `.env.example`):

- `PORT`: HTTP port for Express server (default `3000`).
- `NODE_ENV`: `development` or `production`.
- `MONGODB_URI`: Connection string for MongoDB (optional; falls back to persistent in-memory store if unset).
- `JWT_SECRET`: Secret key for signing and verifying JSON Web Tokens.
- `STRIPE_SECRET_KEY`: Server-side secret key for payment gateway.
- `CLOUDINARY_API_SECRET`: Server-side secret key for signed asset uploads.

---

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The application will be served at `http://localhost:3000`.

3. **Type-Check & Build**:
   ```bash
   npm run build
   ```

4. **Production Start**:
   ```bash
   npm start
   ```
