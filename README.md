# Guru Glass — Website & Admin Panel

A full-stack Node.js website for Guru Glass, a custom hand-blown glass art business.

## Features

- **Public storefront** — Home page, product gallery, and contact/order inquiry form
- **Admin dashboard** — Password-protected panel to manage products and client orders
- **SQLite database** — No external database needed; file-based, included with the app
- **Session auth** — Secure admin login with server-side sessions

---

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your preferred admin credentials

# 3. Start the server
npm start

# Visit: http://localhost:3000
# Admin:  http://localhost:3000/admin
```

---

## Default Admin Credentials

```
Username: admin
Password: guruglass2024
```

**Change these before deploying!** Edit `ADMIN_USER` and `ADMIN_PASS` in your `.env` file.

---

## Deploying on Render (Web Service)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial Guru Glass app"
git remote add origin https://github.com/YOUR_USERNAME/guruglass.git
git push -u origin main
```

> **Important:** Add `.env` and `guruglass.db` to `.gitignore` before pushing.

### Step 2 — Create a Web Service on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `guruglass` (or your choice) |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (or Starter for always-on) |

### Step 3 — Add Environment Variables

In your Render service settings → **Environment**, add:

| Key | Value |
|-----|-------|
| `ADMIN_USER` | `admin` (change this!) |
| `ADMIN_PASS` | Your secure password |
| `SESSION_SECRET` | A long random string (run `openssl rand -hex 32`) |
| `NODE_ENV` | `production` |

### Step 4 — Deploy

Click **Create Web Service**. Render will build and deploy automatically.

> **Note on SQLite with Render Free tier:** Render's free tier uses ephemeral storage — the SQLite file resets on redeploy. To persist data, either upgrade to a paid plan with a persistent disk, or migrate to a hosted database like Render's PostgreSQL or Supabase. For a small glass art business, the free tier is fine for getting started; just re-add products after deploys.

---

## File Structure

```
guruglass/
├── server.js          — Express app, routes, auth
├── database.js        — SQLite setup, table creation, seed data
├── package.json
├── .env               — Your local environment variables (not committed)
├── .env.example       — Template for env vars
├── public/
│   ├── style.css      — Public site styles
│   ├── admin.css      — Admin panel styles
│   └── script.js      — Public site JavaScript
└── views/
    ├── index.html     — Home/storefront
    ├── products.html  — Products gallery
    ├── contact.html   — Order inquiry form
    ├── login.html     — Admin login
    └── admin.html     — Admin dashboard
```

---

## API Endpoints

### Public
- `GET /` — Home page
- `GET /products` — Products gallery
- `GET /contact` — Order inquiry form
- `GET /api/products` — JSON list of all products
- `POST /api/contact` — Submit an order inquiry

### Admin (requires login session)
- `GET /admin` — Admin dashboard
- `POST /api/login` — Authenticate
- `POST /api/logout` — Sign out
- `GET /api/admin/products` — All products
- `POST /api/admin/products` — Add product
- `PUT /api/admin/products/:id` — Update product
- `DELETE /api/admin/products/:id` — Delete product
- `GET /api/admin/clients` — All client orders
- `POST /api/admin/clients` — Add client manually
- `PUT /api/admin/clients/:id` — Update client (e.g. mark complete)
- `DELETE /api/admin/clients/:id` — Delete client

---

## Customizing

**Change business name/tagline:** Edit the HTML in `views/index.html`, `views/products.html`, etc.

**Change colors:** Edit the CSS variables in `public/style.css` (`:root` block at the top).

**Add YouTube videos:** In the admin dashboard, paste a YouTube URL into a product's "YouTube URL" field. The product card will show a video embed instead of a photo.

**Change admin password:** Update `ADMIN_PASS` in your `.env` file and redeploy.

---

## .gitignore (recommended)

Create a `.gitignore` file with:

```
node_modules/
.env
guruglass.db
*.db-shm
*.db-wal
```
