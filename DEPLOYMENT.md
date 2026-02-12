# Tord Labs - cPanel Deployment Guide

## Quick Deployment Steps

### 1. Build & Bundle (on Replit)
```bash
npm run build
cp client/public/trading-preview.png dist/public/trading-preview.png
cp -r client/public/ai-logos dist/public/ai-logos
rm -f tordlabs-cpanel.zip
zip -r tordlabs-cpanel.zip .htaccess dist/index.cjs dist/public/ package.json package-lock.json shared/ drizzle.config.ts cpanel-setup/ server/ client/ database_setup.sql DEPLOYMENT.md -x "client/node_modules/*" "*/node_modules/*" "*.map" "dist/public/tordlabs-deploy.tar.gz"
```

### 2. Upload to cPanel
- Upload `tordlabs-cpanel.zip` to the cPanel File Manager root (your domain root, e.g. `tordlabs.com/`)
- Extract the zip
- Open SSH Terminal or cPanel Terminal and run:
```bash
npm install --production
```

### 3. cPanel Node.js App Settings
| Setting | Value |
|---|---|
| Node.js version | 18.20.8+ |
| Application mode | Production |
| Application root | tordlabs.com |
| Application URL | tordlabs.com |
| Application startup file | dist/index.cjs |

### 4. Start the App
- Click "Run NPM Install" in cPanel Node.js app
- Click "Run JS Script" > start (or restart the app)
- App runs on port 3000 internally, proxied via .htaccess

### 5. .htaccess (Proxy to Node)
Already included in the zip. Contents:
```
DirectoryIndex disabled
RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
```

---

## Environment Variables (Set ALL of these in cPanel)

### Required Environment Variables
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://shieqfjm:PASSWORD@127.0.0.200:5432/shieqfjm_tordpg` |
| `DEEPSEEK_API_KEY` | DeepSeek API key for AI chat & token analysis | `sk-...` |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI image generation & admin AI features | `sk-or-...` |
| `GATEIO_API_KEY` | Gate.io API key for futures trading | Your Gate.io API key |
| `GATEIO_API_SECRET` | Gate.io API secret for futures trading | Your Gate.io API secret |
| `NODE_ENV` | Must be set to production | `production` |
| `PORT` | Server port (cPanel uses 3000) | `3000` |

### Summary of ALL Environment Variables on cPanel
These are the exact variables you should have in your cPanel Node.js app:
```
DATABASE_URL = postgresql://shieqfjm:YOUR_PASSWORD@127.0.0.200:5432/shieqfjm_tordpg
DEEPSEEK_API_KEY = sk-your-deepseek-key
OPENROUTER_API_KEY = sk-or-your-openrouter-key
GATEIO_API_KEY = your-gateio-api-key
GATEIO_API_SECRET = your-gateio-api-secret
NODE_ENV = production
PORT = 3000
```

**Note:** `SESSION_SECRET`, `BSCSCAN_API_KEY`, and `GATEIO_SUB_ACCOUNT_UID` are NOT used by the code and do NOT need to be set.

---

## Database (PostgreSQL on cPanel)

### Your cPanel Database
- Database name: `shieqfjm_tordpg`
- Host: `127.0.0.200`
- Port: `5432`
- User: `shieqfjm`
- Access via: phpPgAdmin in cPanel

### Database Tables (8 tables required)
| Table | Description |
|---|---|
| `users` | User accounts (id UUID, username, password) |
| `site_settings` | Admin-managed settings (key-value pairs, TORD/staking addresses, social links) |
| `image_history` | AI image generation history (prompt, model, image_url, conversation_id) |
| `trading_accounts` | Wallet-to-Gate.io subaccount mapping (wallet_address, gate_sub_uid, gate_login_name) |
| `user_balances` | Platform USDT balances per wallet (balance, total_deposited, total_withdrawn) |
| `deposit_history` | Deposit records (wallet, amount, tx_hash, status, network BEP20) |
| `withdrawal_history` | Withdrawal records (wallet, amount, to_address, tx_hash, status) |
| `subaccount_pool` | Pre-created Gate.io subaccount pool for assignment |

### Creating Tables on a NEW Database
If you need to create the tables on a fresh database, use ONE of these methods:

**Option A: Run the SQL script**
1. Open phpPgAdmin in cPanel
2. Select your database (e.g. `shieqfjm_tordpg`)
3. Click "SQL" tab
4. Copy and paste the contents of `database_setup.sql` (included in the zip)
5. Click "Execute"

**Option B: Use Drizzle ORM push**
1. Set `DATABASE_URL` in your environment
2. Run via SSH:
```bash
npx drizzle-kit push
```
This will auto-create all tables from `shared/schema.ts`.

### Your Existing Database
Your cPanel database (`shieqfjm_tordpg`) already has all 8 required tables plus 2 extra tables (`conversations`, `messages`). The extra tables are harmless and can be left as-is or dropped if you want to clean up:
```sql
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS messages;
```

---

## NPM Scripts
| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR (port 5000) - Replit only |
| `npm run build` | Build client (Vite) + server (esbuild) to `dist/` |
| `npm run start` | Start production server from `dist/index.cjs` (port 3000) |
| `npm run db:push` | Sync Drizzle schema to database |

---

## Key Files
| File | Purpose |
|---|---|
| `dist/index.cjs` | Production server bundle (this is what runs on cPanel) |
| `dist/public/` | Built frontend assets (HTML, JS, CSS, images) |
| `shared/schema.ts` | Database schema (Drizzle ORM) |
| `server/routes.ts` | All API routes |
| `server/gateio.ts` | Gate.io API service (HMAC-SHA512 auth) |
| `server/storage.ts` | Database storage interface |
| `server/http-client.ts` | HTTP client (native Node.js, no external deps) |
| `client/src/pages/` | All frontend pages |
| `client/src/lib/i18n.tsx` | Bilingual (EN/CN) translations |
| `.htaccess` | Apache reverse proxy config |
| `database_setup.sql` | SQL script to create all tables |
| `cpanel-setup/.env.example` | Example environment variables |
| `cpanel-setup/ecosystem.config.cjs` | PM2 config (optional) |

---

## Architecture Notes
- Frontend: React 18 + Vite + Tailwind CSS + shadcn/ui
- Backend: Express 5 + TypeScript (bundled to single CJS file)
- Database: PostgreSQL with Drizzle ORM
- Trading: Gate.io Futures API v4 with per-user subaccounts
- Auth: Wallet-based (MetaMask), wallet address sent via `x-wallet-address` header
- Fee model: 0.05% platform fee + 0.075% Gate.io fee = 0.125% total
- Token gate: 1M $TORD minimum to create trading account
- Languages: English + Chinese (toggle in header)
- Admin panel: `/admin` route with token-based auth (username: admin)
- AI features: DeepSeek (chat, research, token analysis) + OpenRouter (image generation)

---

## Troubleshooting

### App won't start
1. Check that `dist/index.cjs` exists
2. Verify `DATABASE_URL` is correct and database is accessible
3. Check Node.js version is 18+
4. Run `npm install --production` if node_modules is missing

### Database connection fails
1. Verify PostgreSQL is running on `127.0.0.200:5432`
2. Check username/password in `DATABASE_URL`
3. Make sure the database exists and user has access

### AI features not working
1. Check `DEEPSEEK_API_KEY` is set and valid
2. Check `OPENROUTER_API_KEY` is set and valid
3. These APIs need internet access from your server

### Trading not working
1. Check `GATEIO_API_KEY` and `GATEIO_API_SECRET` are set
2. Verify Gate.io API permissions (futures trading enabled)
3. Check subaccount pool has available slots

---

## Live Site
- URL: https://tordlabs.com/
- Hosted on: cPanel (premium129.web-hosting.com)
- Node.js port: 3000 (proxied via .htaccess)
