-- TordLabs Database Setup Script
-- Run this in your phpPgAdmin on cPanel
-- Database: shieqfjm_tordpg (or your database name)

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- 2. Site Settings table
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Image History table
CREATE TABLE IF NOT EXISTS image_history (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  aspect_ratio TEXT DEFAULT '1:1',
  image_size TEXT DEFAULT '1K',
  image_url TEXT,
  source_image_url TEXT,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Trading Accounts table (links wallet to Gate.io subaccount)
CREATE TABLE IF NOT EXISTS trading_accounts (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(100) NOT NULL UNIQUE,
  gate_sub_uid VARCHAR(50) NOT NULL UNIQUE,
  gate_login_name VARCHAR(100) NOT NULL,
  gate_email VARCHAR(200),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. User Balances table (tracks USDT deposits)
CREATE TABLE IF NOT EXISTS user_balances (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(100) NOT NULL UNIQUE,
  balance NUMERIC(20,8) NOT NULL DEFAULT 0,
  total_deposited NUMERIC(20,8) NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC(20,8) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Deposit History table
CREATE TABLE IF NOT EXISTS deposit_history (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(100) NOT NULL,
  amount NUMERIC(20,8) NOT NULL,
  tx_hash VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  network VARCHAR(20) NOT NULL DEFAULT 'BEP20',
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP
);

-- 7. Withdrawal History table
CREATE TABLE IF NOT EXISTS withdrawal_history (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(100) NOT NULL,
  amount NUMERIC(20,8) NOT NULL,
  to_address VARCHAR(100) NOT NULL,
  tx_hash VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  network VARCHAR(20) NOT NULL DEFAULT 'BEP20',
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- 8. Subaccount Pool table (pre-created Gate.io subaccounts)
CREATE TABLE IF NOT EXISTS subaccount_pool (
  id SERIAL PRIMARY KEY,
  gate_sub_uid VARCHAR(50) NOT NULL UNIQUE,
  gate_login_name VARCHAR(100) NOT NULL,
  assigned_wallet VARCHAR(100),
  assigned_at TIMESTAMP
);

-- 9. Seed the 8 existing Gate.io subaccounts
INSERT INTO subaccount_pool (gate_sub_uid, gate_login_name) VALUES
  ('49130278', 'tordlabs'),
  ('49133173', 'tordlabs1'),
  ('49133239', 'tordlabs2'),
  ('49133257', 'tordlabs3'),
  ('49133275', 'tordlabs4'),
  ('49133304', 'tordlabs5'),
  ('49133328', 'tordlabs6'),
  ('49133355', 'tordlabs7')
ON CONFLICT (gate_sub_uid) DO NOTHING;

-- 10. Airdrop Campaigns table
CREATE TABLE IF NOT EXISTS airdrop_campaigns (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL DEFAULT 'TORD Airdrop Campaign',
  description TEXT DEFAULT '',
  total_prize VARCHAR(100) DEFAULT '10,000,000 $TORD',
  max_winners INTEGER DEFAULT 200,
  reward_per_user INTEGER DEFAULT 50000,
  banner_url TEXT,
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 11. Airdrop Tasks table
CREATE TABLE IF NOT EXISTS airdrop_tasks (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES airdrop_campaigns(id),
  task_key VARCHAR(100),
  label VARCHAR(200) NOT NULL,
  points INTEGER DEFAULT 10000,
  task_type VARCHAR(50) NOT NULL DEFAULT 'social',
  action_url VARCHAR(500) DEFAULT '',
  button_text VARCHAR(100) DEFAULT 'Go',
  icon_type VARCHAR(50) DEFAULT 'link',
  sort_order INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 12. Airdrop Participants table
CREATE TABLE IF NOT EXISTS airdrop_participants (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES airdrop_campaigns(id),
  x_username VARCHAR(100),
  wallet_address VARCHAR(100),
  ip_address VARCHAR(50),
  ip_hash VARCHAR(100),
  tasks_completed TEXT DEFAULT '[]',
  total_reward NUMERIC(20,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 13. TordAI Chats table (stores chat history by IP)
CREATE TABLE IF NOT EXISTS tordai_chats (
  id VARCHAR(100) PRIMARY KEY,
  ip_address VARCHAR(50) NOT NULL,
  title TEXT DEFAULT 'New Chat',
  messages TEXT DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 14. Premium Members table (paid subscription/credit pack users)
CREATE TABLE IF NOT EXISTS premium_members (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(100) NOT NULL UNIQUE,
  premium_balance NUMERIC(20,8) NOT NULL DEFAULT 0,
  total_purchased NUMERIC(20,8) NOT NULL DEFAULT 0,
  total_used NUMERIC(20,8) NOT NULL DEFAULT 0,
  current_plan VARCHAR(50),
  plan_type VARCHAR(20),
  plan_expires_at TIMESTAMP,
  badge VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 11. Premium Purchases table (payment transaction history)
CREATE TABLE IF NOT EXISTS premium_purchases (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(100) NOT NULL,
  tx_hash VARCHAR(100) NOT NULL UNIQUE,
  amount NUMERIC(20,8) NOT NULL,
  balance_added NUMERIC(20,8) NOT NULL,
  plan_name VARCHAR(50) NOT NULL,
  purchase_type VARCHAR(20) NOT NULL,
  billing_cycle VARCHAR(20),
  from_address VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
