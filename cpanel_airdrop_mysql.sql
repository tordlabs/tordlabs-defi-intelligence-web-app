-- ========================================
-- TORD LABS - Airdrop System MySQL Tables
-- Run this in cPanel phpMyAdmin
-- ========================================

-- Airdrop Campaigns
CREATE TABLE IF NOT EXISTS airdrop_campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) DEFAULT 'TordLabs Airdrop',
  description TEXT,
  banner_url VARCHAR(500) DEFAULT '/airdrop-hero-v2.png',
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  is_active TINYINT(1) DEFAULT 1,
  max_winners INT DEFAULT 200,
  reward_per_user INT DEFAULT 50000,
  total_prize VARCHAR(100) DEFAULT '10,000,000 $TORD',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Airdrop Tasks
CREATE TABLE IF NOT EXISTS airdrop_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  task_key VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  points INT DEFAULT 10,
  task_type VARCHAR(20) DEFAULT 'action',
  action_url VARCHAR(500),
  button_text VARCHAR(100),
  icon_type VARCHAR(20) DEFAULT 'wallet',
  sort_order INT DEFAULT 0,
  is_locked TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES airdrop_campaigns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Airdrop Participants
CREATE TABLE IF NOT EXISTS airdrop_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  x_username VARCHAR(100) NOT NULL,
  wallet_address VARCHAR(100),
  ip_address VARCHAR(45),
  ip_hash VARCHAR(64),
  tasks_completed JSON,
  total_reward INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES airdrop_campaigns(id) ON DELETE CASCADE,
  INDEX idx_campaign_ip (campaign_id, ip_hash),
  INDEX idx_campaign_user (campaign_id, x_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  1
);

-- Insert default tasks (using LAST_INSERT_ID() for the campaign)
SET @campaign_id = LAST_INSERT_ID();

INSERT INTO airdrop_tasks (campaign_id, task_key, label, points, task_type, action_url, button_text, icon_type, sort_order, is_locked) VALUES
(@campaign_id, 'wallet', 'Enter Your BNB Wallet Address', 0, 'wallet', NULL, 'Submit Wallet', 'wallet', 0, 0),
(@campaign_id, 'follow', 'Follow @torddefi on X', 10, 'action', 'https://twitter.com/intent/follow?screen_name=torddefi', 'Follow @torddefi', 'x', 1, 0),
(@campaign_id, 'tweet', 'Tweet About $TORD', 10, 'action', 'https://twitter.com/intent/tweet?text=Just%20joined%20the%20%24TORD%20airdrop%20from%20%40torddefi%20%F0%9F%94%A5&hashtags=TORD,DeFi,Airdrop', 'Post on X', 'x', 2, 0),
(@campaign_id, 'telegram', 'Join @TordLabs on Telegram', 10, 'action', 'https://t.me/tordlabs', 'Join Telegram', 'telegram', 3, 0),
(@campaign_id, 'share', 'Share Airdrop Link', 10, 'action', NULL, 'Copy & Share', 'wallet', 4, 1),
(@campaign_id, 'bonus', 'Bonus Reward', 10, 'bonus', NULL, 'Claim Bonus', 'bonus', 5, 1);
