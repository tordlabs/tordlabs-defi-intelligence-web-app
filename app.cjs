const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

const dbUrl = process.env.DATABASE_URL || '';
const decodedDbUrl = decodeURIComponent(dbUrl);
const isLocalDB = decodedDbUrl.includes('localhost') || decodedDbUrl.includes('127.0.0.1') || decodedDbUrl.includes('127.0.0');
const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocalDB ? false : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false)
});
pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});
console.log('DB SSL mode:', isLocalDB ? 'OFF (local database)' : 'ON');
console.log('DB URL contains 127.0.0.1:', decodedDbUrl.includes('127.0.0.1'));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.set('trust proxy', true);

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'YOUR_ADMIN_PASSWORD';
const SESSION_TTL = 1440 * 60 * 1000;
const sessions = new Map();

function generateSessionId() {
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 16)}`;
}

function isValidSession(token) {
  const expiry = sessions.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) { sessions.delete(token); return false; }
  return true;
}

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  if (!isValidSession(token)) return res.status(401).json({ error: 'Invalid or expired session' });
  next();
}

function airdropAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.replace('Bearer ', '');
  if (!isValidSession(token) && token !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Invalid credentials' });
  next();
}

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.ip || 'unknown';
}

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + 'tord_salt_2025').digest('hex');
}

const ALLOWED_SETTINGS = new Set(['tord_contract', 'staking_contract', 'twitter_url', 'telegram_url', 'github_url', 'discord_url', 'website_url']);

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if ((username === ADMIN_USERNAME && password === ADMIN_PASSWORD) || (!username && password === ADMIN_PASSWORD)) {
    const token = generateSessionId();
    sessions.set(token, Date.now() + SESSION_TTL);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) sessions.delete(authHeader.split(' ')[1]);
  res.json({ success: true });
});

app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ') && isValidSession(authHeader.split(' ')[1])) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

app.get('/api/admin/settings', adminAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM site_settings');
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ settings });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/admin/settings', adminAuth, async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') return res.status(400).json({ error: 'Settings object is required' });

    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'string' && ALLOWED_SETTINGS.has(key)) {
        if ((key === 'tord_contract' || key === 'staking_contract') && value && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
          return res.status(400).json({ error: `Invalid contract address format for ${key}` });
        }
        await pool.query(
          'INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
          [key, value]
        );
      }
    }

    const result = await pool.query('SELECT key, value FROM site_settings');
    const updated = {};
    result.rows.forEach(r => { updated[r.key] = r.value; });
    res.json({ settings: updated });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.get('/api/campaign', async (req, res) => {
  try {
    const campaign = await pool.query(
      'SELECT * FROM airdrop_campaigns ORDER BY id DESC LIMIT 1'
    );
    if (campaign.rows.length === 0) return res.json({ campaign: null });

    const tasks = await pool.query(
      'SELECT * FROM airdrop_tasks WHERE campaign_id = $1 AND is_active = true ORDER BY sort_order',
      [campaign.rows[0].id]
    );

    let countResult;
    try {
      countResult = await pool.query(
        'SELECT COUNT(DISTINCT ip_hash) as total FROM airdrop_participants WHERE campaign_id = $1',
        [campaign.rows[0].id]
      );
    } catch(colErr) {
      countResult = await pool.query(
        'SELECT COUNT(*) as total FROM airdrop_participants WHERE campaign_id = $1',
        [campaign.rows[0].id]
      );
    }

    res.json({
      campaign: campaign.rows[0],
      tasks: tasks.rows,
      participantCount: parseInt(countResult.rows[0].total)
    });
  } catch (err) {
    console.error('Campaign fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/participate', async (req, res) => {
  try {
    const { x_username, wallet_address, tasks_completed, campaign_id } = req.body;
    if (!x_username || !campaign_id) return res.status(400).json({ error: 'Missing required fields' });

    const campaignCheck = await pool.query('SELECT is_active, end_date FROM airdrop_campaigns WHERE id = $1', [campaign_id]);
    if (campaignCheck.rows.length === 0) return res.status(404).json({ error: 'Campaign not found' });
    const camp = campaignCheck.rows[0];
    if (!camp.is_active) return res.json({ success: false, message: 'This campaign has ended. Stay tuned for the next one!' });
    if (camp.end_date && new Date(camp.end_date) < new Date()) return res.json({ success: false, message: 'This campaign has ended. Stay tuned for the next one!' });

    const ip = getClientIP(req);
    const ipHash = hashIP(ip);

    const existing = await pool.query(
      'SELECT id, x_username FROM airdrop_participants WHERE campaign_id = $1 AND ip_hash = $2',
      [campaign_id, ipHash]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE airdrop_participants SET tasks_completed = $1, wallet_address = COALESCE($2, wallet_address),
         total_reward = $3, updated_at = NOW() WHERE campaign_id = $4 AND ip_hash = $5`,
        [JSON.stringify(tasks_completed), wallet_address, calculateReward(tasks_completed), campaign_id, ipHash]
      );
      return res.json({ success: true, updated: true, message: 'Entry updated' });
    }

    await pool.query(
      `INSERT INTO airdrop_participants (campaign_id, x_username, wallet_address, ip_address, ip_hash, tasks_completed, total_reward)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [campaign_id, x_username, wallet_address, ip, ipHash, JSON.stringify(tasks_completed), calculateReward(tasks_completed)]
    );

    res.json({ success: true, message: 'Entry recorded' });
  } catch (err) {
    if (err.code === '23505') {
      return res.json({ success: false, message: 'This IP address has already been registered for this campaign.' });
    }
    console.error('Participate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

function calculateReward(tasks) {
  if (!tasks) return 0;
  let total = 0;
  Object.values(tasks).forEach(t => {
    if (t.completed && t.points) total += t.points * 1000;
  });
  return total;
}

app.get('/api/admin/campaign', airdropAuth, async (req, res) => {
  try {
    const campaigns = await pool.query(
      `SELECT c.*, COALESCE(p.cnt, 0) as participant_count
       FROM airdrop_campaigns c
       LEFT JOIN (SELECT campaign_id, COUNT(*) as cnt FROM airdrop_participants GROUP BY campaign_id) p
       ON c.id = p.campaign_id
       ORDER BY c.id DESC`
    );
    res.json({ campaigns: campaigns.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/campaign/:id/restore', airdropAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE airdrop_campaigns SET is_active = false');
    await pool.query('UPDATE airdrop_campaigns SET is_active = true, updated_at = NOW() WHERE id = $1', [id]);
    const result = await pool.query('SELECT * FROM airdrop_campaigns WHERE id = $1', [id]);
    res.json({ success: true, campaign: result.rows[0] });
  } catch (err) {
    console.error('Restore campaign error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/campaign/:id', airdropAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, banner_url, start_date, end_date, is_active, max_winners, reward_per_user, total_prize } = req.body;

    await pool.query(
      `UPDATE airdrop_campaigns SET title = COALESCE($1, title), description = COALESCE($2, description),
       banner_url = COALESCE($3, banner_url), start_date = COALESCE($4, start_date),
       end_date = COALESCE($5, end_date), is_active = COALESCE($6, is_active),
       max_winners = COALESCE($7, max_winners), reward_per_user = COALESCE($8, reward_per_user),
       total_prize = COALESCE($9, total_prize), updated_at = NOW()
       WHERE id = $10`,
      [title, description, banner_url, start_date, end_date, is_active, max_winners, reward_per_user, total_prize, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Campaign update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/tasks/:campaignId', airdropAuth, async (req, res) => {
  try {
    const tasks = await pool.query(
      'SELECT * FROM airdrop_tasks WHERE campaign_id = $1 ORDER BY sort_order',
      [req.params.campaignId]
    );
    res.json({ tasks: tasks.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/task/:id', airdropAuth, async (req, res) => {
  try {
    const { label, points, action_url, button_text, icon_type, is_locked, is_active, sort_order } = req.body;
    await pool.query(
      `UPDATE airdrop_tasks SET label = COALESCE($1, label), points = COALESCE($2, points),
       action_url = COALESCE($3, action_url), button_text = COALESCE($4, button_text),
       icon_type = COALESCE($5, icon_type), is_locked = COALESCE($6, is_locked),
       is_active = COALESCE($7, is_active), sort_order = COALESCE($8, sort_order)
       WHERE id = $9`,
      [label, points, action_url, button_text, icon_type, is_locked, is_active, sort_order, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/task', airdropAuth, async (req, res) => {
  try {
    const { campaign_id, task_key, label, points, task_type, action_url, button_text, icon_type, sort_order, is_locked } = req.body;
    const result = await pool.query(
      `INSERT INTO airdrop_tasks (campaign_id, task_key, label, points, task_type, action_url, button_text, icon_type, sort_order, is_locked)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [campaign_id, task_key, label, points || 10, task_type || 'action', action_url, button_text, icon_type || 'wallet', sort_order || 0, is_locked || false]
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/task/:id', airdropAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM airdrop_tasks WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/participants/:campaignId', airdropAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, x_username, wallet_address, ip_address, tasks_completed, total_reward, created_at, updated_at FROM airdrop_participants WHERE campaign_id = $1';
    let params = [req.params.campaignId];

    if (search) {
      query += ' AND (x_username ILIKE $2 OR wallet_address ILIKE $2)';
      params.push('%' + search + '%');
    }

    const countQuery = query.replace('SELECT id, x_username, wallet_address, ip_address, tasks_completed, total_reward, created_at, updated_at', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({
      participants: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
    });
  } catch (err) {
    console.error('Participants fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/participants/:campaignId/export', (req, res, next) => {
  if (req.query.token) req.headers.authorization = 'Bearer ' + req.query.token;
  airdropAuth(req, res, next);
}, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT x_username, wallet_address, ip_address, tasks_completed, total_reward, created_at FROM airdrop_participants WHERE campaign_id = $1 ORDER BY created_at DESC',
      [req.params.campaignId]
    );

    let csv = 'X Username,Wallet Address,IP Address,Tasks Completed,Total Reward,Joined At\n';
    result.rows.forEach(row => {
      const tasks = row.tasks_completed ? Object.keys(row.tasks_completed).filter(k => row.tasks_completed[k]?.completed).join(';') : '';
      csv += `${row.x_username},${row.wallet_address || ''},${row.ip_address || ''},${tasks},${row.total_reward},${row.created_at}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=airdrop-participants.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/campaign/new', airdropAuth, async (req, res) => {
  try {
    const { title, description, total_prize, max_winners, reward_per_user, keep_tasks } = req.body;

    const prevCampaign = await pool.query('SELECT id FROM airdrop_campaigns WHERE is_active = true ORDER BY id DESC LIMIT 1');
    const prevCampaignId = prevCampaign.rows.length > 0 ? prevCampaign.rows[0].id : null;

    await pool.query('UPDATE airdrop_campaigns SET is_active = false');

    const result = await pool.query(
      `INSERT INTO airdrop_campaigns (title, description, total_prize, max_winners, reward_per_user, is_active)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
      [
        title || 'TordLabs Airdrop — 200 Winners',
        description || 'Earn free $TORD tokens by completing simple tasks below.',
        total_prize || '10,000,000 $TORD',
        max_winners || 200,
        reward_per_user || 50000
      ]
    );

    const newCampaignId = result.rows[0].id;

    if (keep_tasks && prevCampaignId) {
      await pool.query(
        `INSERT INTO airdrop_tasks (campaign_id, task_key, label, points, task_type, action_url, button_text, icon_type, sort_order, is_locked, is_active)
         SELECT $1, task_key, label, points, task_type, action_url, button_text, icon_type, sort_order, is_locked, is_active
         FROM airdrop_tasks WHERE campaign_id = $2`,
        [newCampaignId, prevCampaignId]
      );
    }

    res.json({ success: true, campaign: result.rows[0] });
  } catch (err) {
    console.error('New campaign error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/participants/:campaignId/clear', airdropAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM airdrop_participants WHERE campaign_id = $1', [req.params.campaignId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/banner-upload', airdropAuth, async (req, res) => {
  try {
    const { image, filename, campaign_id } = req.body;
    if (!image || !campaign_id) return res.status(400).json({ error: 'Missing data' });

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = filename ? path.extname(filename) : '.png';
    const newFilename = 'airdrop-banner' + ext;
    const filePath = path.join(__dirname, 'dist', 'public', newFilename);

    require('fs').writeFileSync(filePath, buffer);

    await pool.query('UPDATE airdrop_campaigns SET banner_url = $1, updated_at = NOW() WHERE id = $2', ['/' + newFilename, campaign_id]);

    res.json({ success: true, url: '/' + newFilename });
  } catch (err) {
    console.error('Banner upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY;
const PAYMENT_WALLET = '0x99DF34AefE68BC1d891729ad39CFa2Bd56E41e6B'.toLowerCase();

const DEV_WALLETS = [
  '0xb7d0e84b85df0ca4811f0564e8d83f51011666a8',
  '0x3e0ba08eeac78c868b425f16695608edf7483a23'
];

const BADGE_CONFIG = {
  dev: { name: 'Developer', icon: '/badges/dev.png', color: '#ef4444' },
  holder: { name: 'Holder', icon: '/badges/holder.png', color: '#22c55e' },
  basic: { name: 'Basic', icon: '/badges/basic.png', color: '#cd7f32' },
  standard: { name: 'Standard', icon: '/badges/standard.png', color: '#c0c0c0' },
  pro: { name: 'Pro', icon: '/badges/pro.png', color: '#f5a623' },
  starter: { name: 'Starter Pack', icon: 'https://cdn-icons-png.flaticon.com/128/3068/3068326.png', color: '#a855f7' },
  creator: { name: 'Creator Pack', icon: '/badges/creator.png', color: '#ec4899' },
  professional: { name: 'Professional Pack', icon: 'https://cdn-icons-png.flaticon.com/128/3068/3068349.png', color: '#f59e0b' }
};

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || 'unknown';
}

app.get('/api/tordai/chats', async (req, res) => {
  try {
    const ip = getClientIp(req);
    const result = await pool.query(
      'SELECT id, title, created_at, updated_at FROM tordai_chats WHERE ip_address = $1 ORDER BY updated_at DESC LIMIT 50',
      [ip]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

app.post('/api/tordai/chats', async (req, res) => {
  try {
    const ip = getClientIp(req);
    const { id, title } = req.body;
    if (!id || !title) return res.status(400).json({ error: 'id and title required' });
    const now = Date.now();
    await pool.query(
      'INSERT INTO tordai_chats (id, ip_address, title, messages, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $5) ON CONFLICT (id) DO UPDATE SET title = $3, updated_at = $5',
      [id, ip, title, '[]', now]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error creating chat:', err);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

app.get('/api/tordai/chats/:id', async (req, res) => {
  try {
    const ip = getClientIp(req);
    const result = await pool.query(
      'SELECT id, title, messages, created_at, updated_at FROM tordai_chats WHERE id = $1 AND ip_address = $2',
      [req.params.id, ip]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Chat not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error loading chat:', err);
    res.status(500).json({ error: 'Failed to load chat' });
  }
});

app.put('/api/tordai/chats/:id', async (req, res) => {
  try {
    const ip = getClientIp(req);
    const { messages, title } = req.body;
    const sets = [];
    const vals = [req.params.id, ip];
    let idx = 3;
    if (messages !== undefined) { sets.push('messages = $' + idx); vals.push(JSON.stringify(messages)); idx++; }
    if (title !== undefined) { sets.push('title = $' + idx); vals.push(title); idx++; }
    sets.push('updated_at = $' + idx); vals.push(Date.now());
    await pool.query(
      'UPDATE tordai_chats SET ' + sets.join(', ') + ' WHERE id = $1 AND ip_address = $2',
      vals
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving chat:', err);
    res.status(500).json({ error: 'Failed to save chat' });
  }
});

app.delete('/api/tordai/chats/:id', async (req, res) => {
  try {
    const ip = getClientIp(req);
    await pool.query('DELETE FROM tordai_chats WHERE id = $1 AND ip_address = $2', [req.params.id, ip]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting chat:', err);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

app.post('/api/bsc-balance', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }
    const USDT = '0x55d398326f99059fF775485246999027B3197955';
    const data = '0x70a08231000000000000000000000000' + address.slice(2).toLowerCase();
    const rpcs = [
      'https://bsc-dataseed.binance.org/',
      'https://bsc-dataseed1.defibit.io/',
      'https://bsc-dataseed1.ninicoin.io/',
      'https://bsc.publicnode.com'
    ];
    let result = null;
    for (const rpc of rpcs) {
      try {
        const resp = await fetch(rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: USDT, data }, 'latest'] })
        });
        const json = await resp.json();
        if (json.result && json.result !== '0x') { result = json.result; break; }
      } catch(e) {}
    }
    res.json({ result: result || '0x0' });
  } catch (err) {
    console.error('BSC balance error:', err);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// === Premium Token System ===
// Ratio: $50 worth of holdings = $1 premium token. Resets every 24h from first connect.
// Current: checks USDT balance. When tord_contract is set in admin1, checks $TORD USD value instead.

const BSC_RPCS = [
  'https://bsc-dataseed.binance.org/',
  'https://bsc-dataseed1.defibit.io/',
  'https://bsc-dataseed1.ninicoin.io/',
  'https://bsc.publicnode.com'
];
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const PANCAKE_FACTORY = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73';

async function getTordContract() {
  try {
    const result = await pool.query("SELECT value FROM site_settings WHERE key = 'tord_contract'");
    if (result.rows.length > 0 && result.rows[0].value && /^0x[a-fA-F0-9]{40}$/.test(result.rows[0].value)) {
      return result.rows[0].value;
    }
  } catch(e) {}
  return null;
}

async function bscCall(to, data) {
  for (const rpc of BSC_RPCS) {
    try {
      const resp = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to, data }, 'latest'] })
      });
      const json = await resp.json();
      if (json.result && json.result !== '0x') return json.result;
    } catch(e) {}
  }
  return null;
}

async function fetchTokenDecimals(tokenAddress) {
  const data = '0x313ce567';
  const result = await bscCall(tokenAddress, data);
  if (result) {
    try { return Number(BigInt(result)); } catch(e) {}
  }
  return 18;
}

async function fetchTokenBalance(address, tokenAddress) {
  const data = '0x70a08231000000000000000000000000' + address.slice(2).toLowerCase();
  const result = await bscCall(tokenAddress, data);
  if (result) {
    const decimals = await fetchTokenDecimals(tokenAddress);
    const raw = BigInt(result);
    const divisor = 10n ** BigInt(decimals);
    return parseFloat((raw * 10000n / divisor).toString()) / 10000;
  }
  return 0;
}

async function fetchTokenPriceUSD(tokenAddress) {
  try {
    const tokenDecimals = await fetchTokenDecimals(tokenAddress);
    const usdtDecimals = await fetchTokenDecimals(USDT_ADDRESS);

    const token0 = tokenAddress.toLowerCase() < USDT_ADDRESS.toLowerCase() ? tokenAddress : USDT_ADDRESS;
    const token1 = tokenAddress.toLowerCase() < USDT_ADDRESS.toLowerCase() ? USDT_ADDRESS : tokenAddress;
    const pairData = '0xe6a43905' +
      token0.slice(2).toLowerCase().padStart(64, '0') +
      token1.slice(2).toLowerCase().padStart(64, '0');
    const pairResult = await bscCall(PANCAKE_FACTORY, pairData);
    if (!pairResult) return 0;
    const pairAddress = '0x' + pairResult.slice(26);
    if (pairAddress === '0x0000000000000000000000000000000000000000') return 0;

    const reservesData = '0x0902f1ac';
    const reservesResult = await bscCall(pairAddress, reservesData);
    if (!reservesResult || reservesResult.length < 130) return 0;

    const reserve0 = BigInt('0x' + reservesResult.slice(2, 66));
    const reserve1 = BigInt('0x' + reservesResult.slice(66, 130));

    if (reserve0 === 0n || reserve1 === 0n) return 0;

    const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();
    const tokenReserve = isToken0 ? reserve0 : reserve1;
    const usdtReserve = isToken0 ? reserve1 : reserve0;
    const tDec = isToken0 ? tokenDecimals : usdtDecimals;
    const uDec = isToken0 ? usdtDecimals : tokenDecimals;

    const scaledUsdt = usdtReserve * (10n ** BigInt(tDec));
    const price = parseFloat(scaledUsdt.toString()) / parseFloat((tokenReserve * (10n ** BigInt(uDec))).toString());
    return price;
  } catch(e) {
    console.error('Token price fetch error:', e.message);
    return 0;
  }
}

async function fetchPremiumUSDValue(address) {
  const tordContract = await getTordContract();
  if (tordContract) {
    try {
      const tordBalance = await fetchTokenBalance(address, tordContract);
      if (tordBalance <= 0) return { usdValue: 0, mode: 'tord', tokenBalance: 0, tokenPrice: 0 };
      const tordPrice = await fetchTokenPriceUSD(tordContract);
      if (tordPrice > 0) {
        const usdValue = tordBalance * tordPrice;
        return { usdValue, mode: 'tord', tokenBalance: tordBalance, tokenPrice: tordPrice };
      }
    } catch(e) {
      console.error('TORD premium fetch failed, falling back to USDT:', e.message);
    }
    const usdtBalance = await fetchTokenBalance(address, USDT_ADDRESS);
    return { usdValue: usdtBalance, mode: 'usdt', tokenBalance: usdtBalance, tokenPrice: 1 };
  }
  const usdtBalance = await fetchTokenBalance(address, USDT_ADDRESS);
  return { usdValue: usdtBalance, mode: 'usdt', tokenBalance: usdtBalance, tokenPrice: 1 };
}

async function fetchUSDTBalance(address) {
  return await fetchTokenBalance(address, USDT_ADDRESS);
}

app.get('/api/premium/mode', async (req, res) => {
  try {
    const tordContract = await getTordContract();
    res.json({ premium_mode: tordContract ? 'tord' : 'usdt', tord_contract: tordContract || null });
  } catch(e) {
    res.json({ premium_mode: 'usdt', tord_contract: null });
  }
});

app.get('/api/premium/status', async (req, res) => {
  try {
    const wallet = (req.query.wallet || '').toLowerCase();
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    if (DEV_WALLETS.includes(wallet)) {
      return res.json({
        registered: true,
        token_allocation: 999999,
        tokens_used: 0,
        tokens_remaining: 999999,
        next_reset: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        usdt_balance: 0,
        premium_mode: 'dev',
        dev: true,
        badge: 'dev',
        badge_config: BADGE_CONFIG.dev
      });
    }

    const tordContract = await getTordContract();
    const premiumMode = tordContract ? 'tord' : 'usdt';
    const result = await pool.query('SELECT * FROM premium_tokens WHERE wallet_address = $1', [wallet]);
    if (result.rows.length === 0) {
      let badge = null;
      let badge_config = null;
      try {
        const memberResult = await pool.query('SELECT badge, premium_balance FROM premium_members WHERE LOWER(wallet_address) = $1', [wallet]);
        if (memberResult.rows.length > 0 && memberResult.rows[0].badge) {
          badge = memberResult.rows[0].badge;
          badge_config = BADGE_CONFIG[badge] || null;
        }
        if (memberResult.rows.length > 0 && parseFloat(memberResult.rows[0].premium_balance) > 0) {
          return res.json({ registered: true, token_allocation: parseFloat(memberResult.rows[0].premium_balance), tokens_used: 0, tokens_remaining: parseFloat(memberResult.rows[0].premium_balance), next_reset: null, usdt_balance: 0, premium_mode: 'purchase', badge, badge_config });
        }
      } catch(e) {}
      return res.json({ registered: false, token_allocation: 0, tokens_used: 0, tokens_remaining: 0, next_reset: null, usdt_balance: 0, premium_mode: premiumMode, badge, badge_config });
    }
    const row = result.rows[0];
    const now = new Date();
    const lastReset = new Date(row.last_reset_at);
    const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
    let allocation = parseFloat(row.token_allocation);
    let used = parseFloat(row.tokens_used);

    if (hoursSinceReset >= 24) {
      const { usdValue } = await fetchPremiumUSDValue(wallet);
      const effectiveBalance = Math.max(usdValue, parseFloat(row.highest_balance));
      allocation = Math.floor(effectiveBalance / 50);
      used = 0;
      await pool.query(
        'UPDATE premium_tokens SET usdt_balance_snapshot = $1, token_allocation = $2, tokens_used = 0, highest_balance = $3, last_reset_at = NOW(), updated_at = NOW() WHERE wallet_address = $4',
        [usdValue, allocation, effectiveBalance, wallet]
      );
    }

    const nextReset = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
    let badge = null;
    let badge_config = null;
    try {
      const memberResult = await pool.query('SELECT badge FROM premium_members WHERE LOWER(wallet_address) = $1', [wallet]);
      if (memberResult.rows.length > 0 && memberResult.rows[0].badge) {
        badge = memberResult.rows[0].badge;
        badge_config = BADGE_CONFIG[badge] || null;
      }
    } catch(e) {}
    res.json({
      registered: true,
      token_allocation: allocation,
      tokens_used: used,
      tokens_remaining: Math.max(0, allocation - used),
      next_reset: nextReset.toISOString(),
      usdt_balance: parseFloat(row.usdt_balance_snapshot),
      highest_balance: parseFloat(row.highest_balance),
      premium_mode: premiumMode,
      badge,
      badge_config
    });
  } catch (err) {
    console.error('Premium status error:', err);
    res.status(500).json({ error: 'Failed to get premium status' });
  }
});

app.post('/api/premium/register', async (req, res) => {
  try {
    const wallet = (req.body.wallet || '').toLowerCase();
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    if (DEV_WALLETS.includes(wallet)) {
      return res.json({
        token_allocation: 999999, tokens_used: 0, tokens_remaining: 999999,
        usdt_balance: 0, next_reset: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        premium_mode: 'dev', dev: true, badge: 'dev', badge_config: BADGE_CONFIG.dev,
        token_balance: 0, token_price: 0
      });
    }

    const existing = await pool.query('SELECT * FROM premium_tokens WHERE wallet_address = $1', [wallet]);
    const { usdValue, mode, tokenBalance, tokenPrice } = await fetchPremiumUSDValue(wallet);

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      const prevHighest = parseFloat(row.highest_balance);
      if (usdValue > prevHighest) {
        const newAllocation = Math.floor(usdValue / 50);
        await pool.query(
          'UPDATE premium_tokens SET usdt_balance_snapshot = $1, highest_balance = $2, token_allocation = $3, updated_at = NOW() WHERE wallet_address = $4',
          [usdValue, usdValue, newAllocation, wallet]
        );
        const used = parseFloat(row.tokens_used);
        const nextReset = new Date(new Date(row.last_reset_at).getTime() + 24 * 60 * 60 * 1000);
        return res.json({ token_allocation: newAllocation, tokens_used: used, tokens_remaining: Math.max(0, newAllocation - used), usdt_balance: usdValue, next_reset: nextReset.toISOString(), premium_mode: mode, token_balance: tokenBalance, token_price: tokenPrice });
      } else {
        const now = new Date();
        const lastReset = new Date(row.last_reset_at);
        const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
        let allocation = parseFloat(row.token_allocation);
        let used = parseFloat(row.tokens_used);
        if (hoursSinceReset >= 24) {
          allocation = Math.floor(Math.max(usdValue, prevHighest) / 50);
          used = 0;
          await pool.query(
            'UPDATE premium_tokens SET usdt_balance_snapshot = $1, token_allocation = $2, tokens_used = 0, last_reset_at = NOW(), updated_at = NOW() WHERE wallet_address = $3',
            [usdValue, allocation, wallet]
          );
        }
        const nextReset = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);
        return res.json({ token_allocation: allocation, tokens_used: used, tokens_remaining: Math.max(0, allocation - used), usdt_balance: usdValue, next_reset: nextReset.toISOString(), premium_mode: mode, token_balance: tokenBalance, token_price: tokenPrice });
      }
    }

    const allocation = Math.floor(usdValue / 50);
    await pool.query(
      'INSERT INTO premium_tokens (wallet_address, usdt_balance_snapshot, token_allocation, tokens_used, highest_balance, first_connected_at, last_reset_at) VALUES ($1, $2, $3, 0, $4, NOW(), NOW())',
      [wallet, usdValue, allocation, usdValue]
    );
    const nextReset = new Date(Date.now() + 24 * 60 * 60 * 1000);
    res.json({ token_allocation: allocation, tokens_used: 0, tokens_remaining: allocation, usdt_balance: usdValue, next_reset: nextReset.toISOString(), premium_mode: mode, token_balance: tokenBalance, token_price: tokenPrice });
  } catch (err) {
    console.error('Premium register error:', err);
    res.status(500).json({ error: 'Failed to register premium' });
  }
});

app.post('/api/premium/use', async (req, res) => {
  try {
    const wallet = (req.body.wallet || '').toLowerCase();
    const cost = parseFloat(req.body.cost || 0);
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }
    if (!cost || cost <= 0) return res.status(400).json({ error: 'Invalid cost' });

    if (DEV_WALLETS.includes(wallet)) {
      return res.json({ tokens_used: 0, tokens_remaining: 999999, dev: true });
    }

    const result = await pool.query('SELECT * FROM premium_tokens WHERE wallet_address = $1', [wallet]);
    if (result.rows.length === 0) return res.status(403).json({ error: 'Wallet not registered for premium' });

    const row = result.rows[0];
    const now = new Date();
    const lastReset = new Date(row.last_reset_at);
    const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
    let allocation = parseFloat(row.token_allocation);
    let used = parseFloat(row.tokens_used);

    if (hoursSinceReset >= 24) {
      const { usdValue } = await fetchPremiumUSDValue(wallet);
      const effectiveBalance = Math.max(usdValue, parseFloat(row.highest_balance));
      allocation = Math.floor(effectiveBalance / 50);
      used = 0;
      await pool.query(
        'UPDATE premium_tokens SET usdt_balance_snapshot = $1, token_allocation = $2, tokens_used = 0, highest_balance = $3, last_reset_at = NOW(), updated_at = NOW() WHERE wallet_address = $4',
        [usdValue, allocation, effectiveBalance, wallet]
      );
    }

    const remaining = allocation - used;
    if (cost > remaining) return res.status(403).json({ error: 'Insufficient premium tokens', remaining });

    const newUsed = used + cost;
    await pool.query(
      'UPDATE premium_tokens SET tokens_used = $1, updated_at = NOW() WHERE wallet_address = $2',
      [newUsed, wallet]
    );
    res.json({ success: true, tokens_used: newUsed, tokens_remaining: allocation - newUsed });
  } catch (err) {
    console.error('Premium use error:', err);
    res.status(500).json({ error: 'Failed to use premium token' });
  }
});

app.get('/api/tordai/models', async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) return res.status(500).json({ error: 'API key not configured' });
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': 'Bearer ' + OPENROUTER_API_KEY }
    });
    if (!response.ok) return res.status(500).json({ error: 'Failed to fetch models' });
    const data = await response.json();
    const models = (data.data || []).map(m => ({
      id: m.id,
      name: m.name || m.id,
      desc: m.description || '',
      ctx: m.context_length || 0,
      free: m.id.includes(':free'),
      pricing: m.pricing || {}
    }));
    res.json({ models, total: models.length });
  } catch (err) {
    console.error('Models fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

app.post('/api/tordai/chat', async (req, res) => {
  try {
    const { messages, model } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Messages required' });

    const isVision = model === 'vision';
    const isDeepSeek = model === 'deepseek-chat' || !model;
    const isOpenRouter = !isDeepSeek || isVision;

    if (isOpenRouter) {
      if (!OPENROUTER_API_KEY) return res.status(500).json({ error: 'AI service not configured (OpenRouter)' });
    } else {
      if (!DEEPSEEK_API_KEY) return res.status(500).json({ error: 'AI service not configured (DeepSeek)' });
    }

    let useModel;
    if (isVision) useModel = 'google/gemini-2.5-flash-preview';
    else if (isDeepSeek) useModel = 'deepseek-chat';
    else useModel = model;

    const apiUrl = isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.deepseek.com/chat/completions';
    const apiKey = isOpenRouter ? OPENROUTER_API_KEY : DEEPSEEK_API_KEY;
    const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey };
    if (isOpenRouter) {
      headers['HTTP-Referer'] = 'https://tordlabs.com';
      headers['X-Title'] = 'Tord Labs AI';
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model: useModel, messages, stream: true, max_tokens: 4096 })
    });

    if (!response.ok) {
      const err = await response.text();
      res.write('data: ' + JSON.stringify({ error: 'AI error: ' + response.status }) + '\n\n');
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          res.write(line + '\n\n');
        }
      }
    } catch(e) {}
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('AI chat error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'AI service error' });
    else { res.write('data: [DONE]\n\n'); res.end(); }
  }
});

const FREE_IMAGE_MODELS = [
  'google/gemini-2.5-flash-image-preview',
  'google/gemini-2.5-flash-image',
  'bytedance/seedream-4.5',
  'google/gemini-2.5-flash-preview-05-20',
  'sourceful/riverflow-v2-fast'
];

function extractImageUrl(data) {
  if (data.error) return null;
  const choice = data.choices && data.choices[0];
  if (!choice || !choice.message) return null;

  let imageUrl = null;

  if (choice.message.images && choice.message.images.length > 0) {
    const img = choice.message.images[0];
    if (typeof img === 'string') {
      imageUrl = img.startsWith('data:') ? img : 'data:image/png;base64,' + img;
    } else if (img && img.image_url) {
      imageUrl = img.image_url.url || img.image_url;
    } else if (img && img.url) {
      imageUrl = img.url;
    } else if (img && img.b64_json) {
      imageUrl = 'data:image/png;base64,' + img.b64_json;
    }
  }

  if (!imageUrl && choice.message.content) {
    if (typeof choice.message.content === 'string') {
      const b64Match = choice.message.content.match(/data:image\/[^;]+;base64,[^\s"']+/);
      if (b64Match) imageUrl = b64Match[0];
    } else if (Array.isArray(choice.message.content)) {
      for (const part of choice.message.content) {
        if (part.type === 'image_url' && part.image_url) {
          imageUrl = part.image_url.url || part.image_url;
          break;
        }
        if (part.type === 'image' && part.url) {
          imageUrl = part.url;
          break;
        }
      }
    }
  }

  return imageUrl;
}

app.post('/api/tordai/image', async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) return res.status(500).json({ error: 'Image service not configured' });
    const { prompt, size, images, premium } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    let msgContent;
    if (images && images.length > 0) {
      msgContent = [{ type: 'text', text: 'Generate an image: ' + prompt }];
      images.forEach(imgData => {
        msgContent.push({ type: 'image_url', image_url: { url: imgData } });
      });
    } else {
      msgContent = 'Generate an image: ' + prompt;
    }

    const premiumModel = 'google/gemini-3-pro-image-preview';
    const modelsToTry = premium ? [premiumModel] : [...FREE_IMAGE_MODELS];
    let lastError = 'Image generation failed';
    let usedModel = '';

    for (const imageModel of modelsToTry) {
      try {
        console.log('Trying image model:', imageModel);
        const imageOnly = imageModel.includes('seedream') || imageModel.includes('riverflow') || imageModel.includes('flux');
        const reqBody = {
          model: imageModel,
          messages: [{ role: 'user', content: imageOnly ? (typeof msgContent === 'string' ? msgContent : msgContent) : msgContent }],
        };
        if (imageOnly) {
          reqBody.modalities = ['image'];
        } else {
          reqBody.modalities = ['image', 'text'];
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
            'HTTP-Referer': 'https://tordlabs.com',
            'X-Title': 'Tord Labs AI'
          },
          body: JSON.stringify(reqBody)
        });

        const data = await response.json();

        if (data.error) {
          console.log('Model', imageModel, 'error:', data.error.message || JSON.stringify(data.error));
          lastError = data.error.message || 'Model unavailable';
          continue;
        }

        const imageUrl = extractImageUrl(data);
        if (imageUrl) {
          usedModel = imageModel;
          return res.json({ success: true, imageUrl, data: [{ url: imageUrl }], model: usedModel });
        }

        console.log('Model', imageModel, 'returned no image');
        lastError = 'Model returned text instead of image';
      } catch (modelErr) {
        console.log('Model', imageModel, 'fetch error:', modelErr.message);
        lastError = 'Model connection error';
      }
    }

    const capacityMsg = premium ? 'Premium model is currently unavailable. Please try again later.' : 'All free image models are currently at capacity. Please try again in a moment.';
    res.json({ error: lastError + '. ' + capacityMsg });
  } catch (err) {
    console.error('Image gen error:', err);
    res.status(500).json({ error: 'Image service error' });
  }
});

app.post('/api/tordai/reasoning', async (req, res) => {
  try {
    if (!DEEPSEEK_API_KEY) return res.status(500).json({ error: 'AI service not configured' });
    const { messages } = req.body;
    if (!messages) return res.status(400).json({ error: 'Messages required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + DEEPSEEK_API_KEY },
      body: JSON.stringify({ model: 'deepseek-reasoner', messages, stream: true, max_tokens: 8192 })
    });

    if (!response.ok) {
      res.write('data: ' + JSON.stringify({ error: 'AI error: ' + response.status }) + '\n\n');
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          res.write(line + '\n\n');
        }
      }
    } catch(e) {}
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Reasoning error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'AI service error' });
    else { res.write('data: [DONE]\n\n'); res.end(); }
  }
});

// === Premium Purchase System ===
const PLAN_CONFIG = {
  basic_monthly: { price: 9.90, balance: 9.90, name: 'Basic', type: 'subscription', cycle: 'monthly' },
  basic_annual: { price: 59.40, balance: 118.80, name: 'Basic', type: 'subscription', cycle: 'annual' },
  standard_monthly: { price: 19.90, balance: 19.90, name: 'Standard', type: 'subscription', cycle: 'monthly' },
  standard_annual: { price: 119.40, balance: 238.80, name: 'Standard', type: 'subscription', cycle: 'annual' },
  pro_monthly: { price: 49.90, balance: 49.90, name: 'Pro', type: 'subscription', cycle: 'monthly' },
  pro_annual: { price: 299.40, balance: 598.80, name: 'Pro', type: 'subscription', cycle: 'annual' },
  starter: { price: 9.90, balance: 9.90, name: 'Starter Pack', type: 'credit_pack', cycle: null },
  creator: { price: 24.90, balance: 24.90, name: 'Creator Pack', type: 'credit_pack', cycle: null },
  professional: { price: 49.90, balance: 49.90, name: 'Professional Pack', type: 'credit_pack', cycle: null }
};

async function verifyBscTransaction(txHash) {
  if (!BSCSCAN_API_KEY) throw new Error('BSCScan API key not configured');
  const url = `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${BSCSCAN_API_KEY}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (!data.result || data.result === null) return null;
  const receipt = data.result;

  const txUrl = `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${BSCSCAN_API_KEY}`;
  const txResp = await fetch(txUrl);
  const txData = await txResp.json();
  const tx = txData.result;

  let amount = 0;
  let fromAddress = '';
  let toAddress = '';
  let foundUSDT = false;
  const USDT_BSC = '0x55d398326f99059ff775485246999027b3197955';
  const TRANSFER_TOPIC = 'YOUR_PRIVATE_KEY';

  if (receipt.logs && receipt.logs.length > 0) {
    for (const log of receipt.logs) {
      if (log.address && log.address.toLowerCase() === USDT_BSC &&
          log.topics && log.topics[0] === TRANSFER_TOPIC) {
        const logTo = '0x' + log.topics[2].slice(26).toLowerCase();
        if (logTo === PAYMENT_WALLET) {
          fromAddress = '0x' + log.topics[1].slice(26).toLowerCase();
          toAddress = logTo;
          const rawAmount = BigInt(log.data);
          amount = Number(rawAmount) / 1e18;
          foundUSDT = true;
          break;
        }
      }
    }
  }

  if (!foundUSDT) return { success: false, error: 'No USDT transfer to payment wallet found in this transaction' };

  return {
    success: receipt.status === '0x1',
    from: fromAddress,
    to: toAddress,
    amount,
    blockNumber: parseInt(receipt.blockNumber, 16)
  };
}

app.post('/api/premium/purchase', async (req, res) => {
  try {
    const wallet = (req.body.wallet || '').toLowerCase();
    const txHash = (req.body.tx_hash || '').trim();
    const planKey = req.body.plan;

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) return res.status(400).json({ error: 'Invalid wallet address' });
    if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) return res.status(400).json({ error: 'Invalid transaction hash' });
    if (!planKey || !PLAN_CONFIG[planKey]) return res.status(400).json({ error: 'Invalid plan selected' });

    const existing = await pool.query('SELECT id FROM premium_purchases WHERE tx_hash = $1', [txHash]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'This transaction has already been submitted' });

    const plan = PLAN_CONFIG[planKey];

    const txInfo = await verifyBscTransaction(txHash);
    if (!txInfo) return res.status(400).json({ error: 'Transaction not found on BSC. Please wait a moment and try again.' });
    if (txInfo.error) return res.status(400).json({ error: txInfo.error });
    if (!txInfo.success) return res.status(400).json({ error: 'Transaction failed on blockchain' });

    if (txInfo.from !== wallet) {
      return res.status(400).json({ error: 'Transaction sender does not match your wallet address' });
    }

    const tolerance = plan.price * 0.02;
    if (txInfo.amount < plan.price - tolerance) {
      return res.status(400).json({ error: `Insufficient payment. Expected $${plan.price} USDT, received $${txInfo.amount.toFixed(2)} USDT` });
    }

    await pool.query(
      `INSERT INTO premium_purchases (wallet_address, tx_hash, amount, balance_added, plan_name, purchase_type, billing_cycle, from_address, status, verified_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed', NOW())`,
      [wallet, txHash, txInfo.amount, plan.balance, plan.name, plan.type, plan.cycle, txInfo.from]
    );

    const planBadgeMap = {
      'Basic': 'basic', 'Standard': 'standard', 'Pro': 'pro',
      'Starter Pack': 'starter', 'Creator Pack': 'creator', 'Professional Pack': 'professional'
    };
    const badge = planBadgeMap[plan.name] || null;

    const memberExists = await pool.query('SELECT id FROM premium_members WHERE wallet_address = $1', [wallet]);
    if (memberExists.rows.length === 0) {
      let expiresAt = null;
      if (plan.type === 'subscription') {
        expiresAt = plan.cycle === 'annual' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
      await pool.query(
        `INSERT INTO premium_members (wallet_address, premium_balance, total_purchased, current_plan, plan_type, plan_expires_at, badge)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [wallet, plan.balance, plan.balance, plan.type === 'subscription' ? plan.name : null, plan.type, expiresAt, badge]
      );
    } else {
      if (plan.type === 'subscription') {
        const expiresAt = plan.cycle === 'annual' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await pool.query(
          `UPDATE premium_members SET premium_balance = premium_balance + $1, total_purchased = total_purchased + $2, badge = COALESCE(badge, $3), current_plan = $4, plan_type = $5, plan_expires_at = $6, updated_at = NOW() WHERE wallet_address = $7`,
          [plan.balance, plan.balance, badge, plan.name, plan.type, expiresAt, wallet]
        );
      } else {
        await pool.query(
          `UPDATE premium_members SET premium_balance = premium_balance + $1, total_purchased = total_purchased + $2, badge = COALESCE(badge, $3), updated_at = NOW() WHERE wallet_address = $4`,
          [plan.balance, plan.balance, badge, wallet]
        );
      }
    }

    const member = await pool.query('SELECT premium_balance FROM premium_members WHERE wallet_address = $1', [wallet]);
    res.json({ success: true, balance_added: plan.balance, new_balance: parseFloat(member.rows[0].premium_balance), plan: plan.name });
  } catch (err) {
    console.error('Premium purchase error:', err);
    res.status(500).json({ error: 'Failed to process purchase. Please try again.' });
  }
});

app.get('/api/premium/balance', async (req, res) => {
  try {
    const wallet = (req.query.wallet || '').toLowerCase();
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) return res.status(400).json({ error: 'Invalid wallet address' });

    if (DEV_WALLETS.includes(wallet)) {
      return res.json({
        registered: true,
        premium_balance: 999999,
        total_purchased: 0,
        total_used: 0,
        current_plan: 'Developer',
        plan_type: 'dev',
        badge: 'dev',
        badge_config: BADGE_CONFIG.dev,
        dev: true,
        status: 'active'
      });
    }

    const result = await pool.query('SELECT * FROM premium_members WHERE wallet_address = $1', [wallet]);
    if (result.rows.length === 0) return res.json({ registered: false, premium_balance: 0, total_purchased: 0, total_used: 0 });
    const row = result.rows[0];
    const badge = row.badge || null;
    res.json({
      registered: true,
      premium_balance: parseFloat(row.premium_balance),
      total_purchased: parseFloat(row.total_purchased),
      total_used: parseFloat(row.total_used),
      current_plan: row.current_plan,
      plan_type: row.plan_type,
      plan_expires_at: row.plan_expires_at,
      badge: badge,
      badge_config: badge && BADGE_CONFIG[badge] ? BADGE_CONFIG[badge] : null,
      status: row.status
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

app.post('/api/premium/spend', async (req, res) => {
  try {
    const wallet = (req.body.wallet || '').toLowerCase();
    const headerWallet = (req.headers['x-wallet-address'] || '').toLowerCase();
    const cost = parseFloat(req.body.cost || 0);
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) return res.status(400).json({ error: 'Invalid wallet' });
    if (headerWallet && headerWallet !== wallet) return res.status(403).json({ error: 'Wallet mismatch' });
    if (!cost || cost <= 0) return res.status(400).json({ error: 'Invalid cost' });

    if (DEV_WALLETS.includes(wallet)) {
      return res.json({ success: true, remaining: 999999, dev: true });
    }

    const result = await pool.query('SELECT * FROM premium_members WHERE wallet_address = $1', [wallet]);
    if (result.rows.length === 0) return res.status(403).json({ error: 'No premium membership found' });
    const row = result.rows[0];
    if (row.status === 'banned') return res.status(403).json({ error: 'Account is suspended' });
    const balance = parseFloat(row.premium_balance);
    if (cost > balance) return res.status(403).json({ error: 'Insufficient premium balance', remaining: balance });

    await pool.query(
      'UPDATE premium_members SET premium_balance = premium_balance - $1, total_used = total_used + $1, updated_at = NOW() WHERE wallet_address = $2',
      [cost, wallet]
    );
    res.json({ success: true, remaining: balance - cost });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process' });
  }
});

// === Admin4: Premium Management ===
app.get('/api/admin4/stats', adminAuth, async (req, res) => {
  try {
    const members = await pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'active\') as active, COUNT(*) FILTER (WHERE status = \'banned\') as banned FROM premium_members');
    const purchases = await pool.query('SELECT COUNT(*) as total, COALESCE(SUM(amount), 0) as revenue, COALESCE(SUM(balance_added), 0) as balance_given FROM premium_purchases WHERE status = \'confirmed\'');
    const recent = await pool.query('SELECT COUNT(*) as count FROM premium_purchases WHERE status = \'confirmed\' AND created_at > NOW() - INTERVAL \'7 days\'');
    const topUp = await pool.query('SELECT COALESCE(SUM(total_used), 0) as total_used FROM premium_members');
    res.json({
      members: { total: parseInt(members.rows[0].total), active: parseInt(members.rows[0].active), banned: parseInt(members.rows[0].banned) },
      purchases: { total: parseInt(purchases.rows[0].total), revenue: parseFloat(purchases.rows[0].revenue), balance_given: parseFloat(purchases.rows[0].balance_given) },
      recent_purchases_7d: parseInt(recent.rows[0].count),
      total_balance_used: parseFloat(topUp.rows[0].total_used)
    });
  } catch (err) {
    console.error('Admin4 stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/admin4/members', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 50);
    const search = (req.query.search || '').toLowerCase().trim();
    const status = req.query.status || '';
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params = [];
    if (search) { params.push(`%${search}%`); where += ` AND wallet_address LIKE $${params.length}`; }
    if (status) { params.push(status); where += ` AND status = $${params.length}`; }

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM premium_members ${where}`, params);
    params.push(limit, offset);
    const result = await pool.query(
      `SELECT * FROM premium_members ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ members: result.rows, total: parseInt(countResult.rows[0].total), page, limit });
  } catch (err) {
    console.error('Admin4 members error:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

app.put('/api/admin4/member/:wallet/ban', adminAuth, async (req, res) => {
  try {
    const wallet = req.params.wallet.toLowerCase();
    await pool.query('UPDATE premium_members SET status = \'banned\', updated_at = NOW() WHERE wallet_address = $1', [wallet]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to ban member' }); }
});

app.put('/api/admin4/member/:wallet/unban', adminAuth, async (req, res) => {
  try {
    const wallet = req.params.wallet.toLowerCase();
    await pool.query('UPDATE premium_members SET status = \'active\', updated_at = NOW() WHERE wallet_address = $1', [wallet]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to unban member' }); }
});

app.get('/api/admin4/purchases', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 50);
    const search = (req.query.search || '').toLowerCase().trim();
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params = [];
    if (search) { params.push(`%${search}%`); where += ` AND (wallet_address LIKE $${params.length} OR tx_hash LIKE $${params.length})`; }

    const countResult = await pool.query(`SELECT COUNT(*) as total FROM premium_purchases ${where}`, params);
    params.push(limit, offset);
    const result = await pool.query(
      `SELECT * FROM premium_purchases ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ purchases: result.rows, total: parseInt(countResult.rows[0].total), page, limit });
  } catch (err) {
    console.error('Admin4 purchases error:', err);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

app.get('/api/badges', (req, res) => {
  res.json({ badges: BADGE_CONFIG, dev_wallets: DEV_WALLETS });
});

app.get('/api/admin4/badges', adminAuth, (req, res) => {
  res.json({ badges: BADGE_CONFIG, dev_wallets: DEV_WALLETS });
});

app.post('/api/admin4/member/add', adminAuth, async (req, res) => {
  try {
    const wallet = (req.body.wallet || '').toLowerCase().trim();
    const badge = req.body.badge || null;
    const balance = parseFloat(req.body.balance || 0);
    const plan = req.body.plan || null;
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) return res.status(400).json({ error: 'Invalid wallet address' });
    if (badge && !BADGE_CONFIG[badge]) return res.status(400).json({ error: 'Invalid badge type' });

    const existing = await pool.query('SELECT id FROM premium_members WHERE wallet_address = $1', [wallet]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Wallet already has premium membership' });

    await pool.query(
      `INSERT INTO premium_members (wallet_address, premium_balance, total_purchased, current_plan, badge, status)
       VALUES ($1, $2, $3, $4, $5, 'active')`,
      [wallet, balance, balance, plan, badge]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

app.delete('/api/admin4/member/:wallet', adminAuth, async (req, res) => {
  try {
    const wallet = req.params.wallet.toLowerCase();
    await pool.query('DELETE FROM premium_members WHERE wallet_address = $1', [wallet]);
    res.json({ success: true });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

app.put('/api/admin4/member/:wallet/badge', adminAuth, async (req, res) => {
  try {
    const wallet = req.params.wallet.toLowerCase();
    const badge = req.body.badge || null;
    if (badge && !BADGE_CONFIG[badge]) return res.status(400).json({ error: 'Invalid badge type' });
    await pool.query('UPDATE premium_members SET badge = $1, updated_at = NOW() WHERE wallet_address = $2', [badge, wallet]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Failed to update badge' }); }
});

app.put('/api/admin4/member/:wallet/adjust', adminAuth, async (req, res) => {
  try {
    const wallet = req.params.wallet.toLowerCase();
    const amount = parseFloat(req.body.amount || 0);
    if (!amount) return res.status(400).json({ error: 'Amount required' });
    await pool.query(
      'UPDATE premium_members SET premium_balance = GREATEST(0, premium_balance + $1), updated_at = NOW() WHERE wallet_address = $2',
      [amount, wallet]
    );
    const result = await pool.query('SELECT premium_balance FROM premium_members WHERE wallet_address = $1', [wallet]);
    res.json({ success: true, new_balance: parseFloat(result.rows[0].premium_balance) });
  } catch (err) { res.status(500).json({ error: 'Failed to adjust balance' }); }
});

app.use(express.static(path.join(__dirname, 'dist', 'public'), {
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
}));

app.get('/api/admin4/openrouter-balance', adminAuth, async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_MGMT_KEY || process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.json({ balance: null, error: 'No OpenRouter API key configured' });
    const resp = await fetch('https://openrouter.ai/api/v1/credits', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!resp.ok) return res.json({ balance: null, error: 'Failed to fetch balance' });
    const data = await resp.json();
    res.json({ balance: data.total_credits != null ? parseFloat(data.total_credits) : null, usage: data.total_usage != null ? parseFloat(data.total_usage) : null, remaining: data.remaining_credits != null ? parseFloat(data.remaining_credits) : null, raw: data });
  } catch (err) {
    console.error('OpenRouter balance error:', err);
    res.json({ balance: null, error: 'Failed to fetch balance' });
  }
});

app.get('/airdrop', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'airdrop.html'));
});

app.get('/admin1', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

app.get('/admin2', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'admin2.html'));
});

app.get('/tordai', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'tordai.html'));
});

app.get('/pricing', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'pricing.html'));
});

app.get('/admin4', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'admin4.html'));
});

app.use((req, res) => {
  const filePath = path.join(__dirname, 'dist', 'public', req.path);
  if (require('fs').existsSync(filePath) && require('fs').statSync(filePath).isFile()) {
    res.sendFile(filePath);
  } else {
    res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
  }
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tord Labs server running on port ${PORT}`);
  });
}

module.exports = app;
