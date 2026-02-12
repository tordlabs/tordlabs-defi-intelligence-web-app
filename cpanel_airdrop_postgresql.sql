-- ========================================
-- TORD LABS - Airdrop System PostgreSQL Tables
-- Run this in cPanel phpPgAdmin → SQL tab
-- Database: shieqfjm_tordpg
-- ========================================

-- Airdrop Campaigns
CREATE TABLE IF NOT EXISTS airdrop_campaigns (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) DEFAULT 'TordLabs Airdrop',
  description TEXT,
  banner_url VARCHAR(500) DEFAULT '/airdrop-hero-v2.png',
  start_date TIMESTAMP NULL,
  end_date TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  max_winners INTEGER DEFAULT 200,
  reward_per_user INTEGER DEFAULT 50000,
  total_prize VARCHAR(100) DEFAULT '10,000,000 $TORD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Airdrop Tasks
CREATE TABLE IF NOT EXISTS airdrop_tasks (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES airdrop_campaigns(id) ON DELETE CASCADE,
  task_key VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  points INTEGER DEFAULT 10,
  task_type VARCHAR(20) DEFAULT 'action',
  action_url VARCHAR(500),
  button_text VARCHAR(100),
  icon_type VARCHAR(20) DEFAULT 'wallet',
  sort_order INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Airdrop Participants (collects user data)
CREATE TABLE IF NOT EXISTS airdrop_participants (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES airdrop_campaigns(id) ON DELETE CASCADE,
  x_username VARCHAR(100) NOT NULL,
  wallet_address VARCHAR(100),
  ip_address VARCHAR(45),
  ip_hash VARCHAR(64),
  tasks_completed JSONB DEFAULT '{}',
  total_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_participants_campaign_ip ON airdrop_participants(campaign_id, ip_hash);
CREATE INDEX IF NOT EXISTS idx_participants_campaign_user ON airdrop_participants(campaign_id, x_username);
CREATE INDEX IF NOT EXISTS idx_tasks_campaign ON airdrop_tasks(campaign_id);

-- ========================================
-- Insert default campaign
-- ========================================
INSERT INTO airdrop_campaigns (title, description, total_prize, max_winners, reward_per_user, is_active)
VALUES (
  'TordLabs Airdrop — 200 Winners',
  'Earn free $TORD tokens by completing simple tasks below. Follow our social channels, share with friends, and climb the leaderboard for bonus rewards.',
  '10,000,000 $TORD',
  200,
  50000,
  TRUE
);

-- Insert default tasks
INSERT INTO airdrop_tasks (campaign_id, task_key, label, points, task_type, action_url, button_text, icon_type, sort_order, is_locked) VALUES
((SELECT id FROM airdrop_campaigns ORDER BY id DESC LIMIT 1), 'wallet', 'Enter Your BNB Wallet Address', 0, 'wallet', NULL, 'Submit Wallet', 'wallet', 0, FALSE),
((SELECT id FROM airdrop_campaigns ORDER BY id DESC LIMIT 1), 'follow', 'Follow @torddefi on X', 10, 'action', 'https://twitter.com/intent/follow?screen_name=torddefi', 'Follow @torddefi', 'x', 1, FALSE),
((SELECT id FROM airdrop_campaigns ORDER BY id DESC LIMIT 1), 'tweet', 'Tweet About $TORD', 10, 'action', 'https://twitter.com/intent/tweet?text=Just%20joined%20the%20%24TORD%20airdrop%20from%20%40torddefi%20%F0%9F%94%A5&hashtags=TORD,DeFi,Airdrop', 'Post on X', 'x', 2, FALSE),
((SELECT id FROM airdrop_campaigns ORDER BY id DESC LIMIT 1), 'telegram', 'Join @TordLabs on Telegram', 10, 'action', 'https://t.me/tordlabs', 'Join Telegram', 'telegram', 3, FALSE),
((SELECT id FROM airdrop_campaigns ORDER BY id DESC LIMIT 1), 'share', 'Share Airdrop Link', 10, 'action', NULL, 'Copy & Share', 'wallet', 4, TRUE),
((SELECT id FROM airdrop_campaigns ORDER BY id DESC LIMIT 1), 'bonus', 'Bonus Reward', 10, 'bonus', NULL, 'Claim Bonus', 'bonus', 5, TRUE);
