const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const PORT = process.env.PORT || 3001;
const ADMIN_EMAIL = process.env.POWERLINK_ADMIN_EMAIL || 'admin@powerlink.com';
const ADMIN_PASSWORD = process.env.POWERLINK_ADMIN_PASSWORD || 'PowerLink123';
const sessions = new Map();

// MySQL Connection Pool with Railway Support
const dbConfig = process.env.MYSQL_URL || 'mysql://root:xbvlOZRiWaYaNGBxiQXKvzTsqEmTtFQR@interchange.proxy.rlwy.net:10145/railway';

const pool = mysql.createPool(dbConfig);

// Helper Functions
function getSession(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  return token ? sessions.get(token) : null;
}

function createSession(role, identity) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { token, role, identity, createdAt: new Date().toISOString() });
  return token;
}

function requireAdmin(req, res, next) {
  const session = getSession(req);
  if (!session || session.role !== 'admin') {
    return res.status(401).json({ message: 'Admin authorization required.' });
  }
  req.session = session;
  next();
}

function requireUser(req, res, next) {
  const session = getSession(req);
  if (!session || session.role !== 'customer') {
    return res.status(401).json({ message: 'Customer authorization required.' });
  }
  req.session = session;
  next();
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'powerlink-monolith', timestamp: new Date().toISOString() });
});

app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  const trimmedEmail = String(email || '').trim().toLowerCase();

  if (!fullName || !trimmedEmail || !phone || !password || password.length < 8) {
    return res.status(400).json({ message: 'Missing or invalid registration fields.' });
  }

  try {
    const [rows] = await pool.query('SELECT email FROM users WHERE email = ?', [trimmedEmail]);
    if (rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const id = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO users (id, fullName, email, phone, password, cart) VALUES (?, ?, ?, ?, ?, ?)',
      [id, fullName, trimmedEmail, phone, hashedPassword, JSON.stringify([])]
    );

    const token = createSession('customer', { email: trimmedEmail, fullName });
    res.status(201).json({ message: 'Account created successfully.', token, user: { fullName, email: trimmedEmail, phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = String(email || '').trim().toLowerCase();

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [trimmedEmail]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = createSession('customer', { email: user.email, fullName: user.fullName });
    res.json({
      message: `Welcome back, ${user.fullName}.`,
      token,
      user: { fullName: user.fullName, email: user.email, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (String(email).toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }
  const token = createSession('admin', { email: ADMIN_EMAIL });
  res.json({ message: 'Admin login successful.', token });
});

app.get('/api/me', (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ message: 'No active session.' });
  res.json({ role: session.role, identity: session.identity });
});

app.post('/api/orders', async (req, res) => {
  const session = getSession(req);
  if (!session) return res.status(401).json({ message: 'Login required to create orders.' });

  const { item, type, total, fulfillment, reference: bodyRef } = req.body;
  const reference = bodyRef || `PL-${Date.now()}`;

  if (!item || !type || isNaN(total) || total < 0 || !fulfillment) {
    return res.status(400).json({ message: 'Invalid order payload.' });
  }

  const customerName = session.identity.fullName || session.identity.email;
  const status = type === 'Plumber Booking' ? 'Scheduled' : (fulfillment === 'Pickup' ? 'Preparing' : 'Confirmed');

  try {
    await pool.query(
      'INSERT INTO orders (reference, customer, item, type, total, fulfillment, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [reference, customerName, item, type, total, fulfillment, status]
    );
    res.status(201).json({
      message: 'Order saved successfully.',
      order: { reference, customer: customerName, item, type, total, fulfillment, status, submittedAt: new Date().toISOString() }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save order.' });
  }
});

app.get('/api/cart', requireUser, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT cart FROM users WHERE email = ?', [req.session.identity.email]);
    if (rows.length === 0) return res.status(404).json({ message: 'Customer account not found.' });
    const cartItems = typeof rows[0].cart === 'string' ? JSON.parse(rows[0].cart) : rows[0].cart;
    res.json({ items: cartItems || [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart.' });
  }
});

app.put('/api/cart', requireUser, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ message: 'Invalid cart payload.' });

  const cartData = items.filter(i => i.quantity > 0);
  try {
    const [result] = await pool.query('UPDATE users SET cart = ? WHERE email = ?', [JSON.stringify(cartData), req.session.identity.email]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer account not found.' });
    res.json({ message: 'Cart saved successfully.', items: cartData });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update cart.' });
  }
});

app.get('/api/orders', requireAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders ORDER BY submittedAt DESC');
  res.json({ orders: rows });
});

app.post('/api/registrations', async (req, res) => {
  const { name, specialty, location, experience } = req.body;
  if (!name || !specialty || !location || isNaN(experience)) {
    return res.status(400).json({ message: 'Invalid registration payload.' });
  }

  try {
    await pool.query(
      'INSERT INTO registrations (name, specialty, location, experience, status) VALUES (?, ?, ?, ?, ?)',
      [name, specialty, location, experience, 'Pending Verification']
    );
    res.status(201).json({
      message: 'Registration submitted successfully.',
      registration: { name, specialty, location, experience, status: 'Pending Verification', submittedAt: new Date().toISOString() }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit registration.' });
  }
});

app.post('/api/contact', async (req, res) => {
  const { fullName, email, phone, service, message } = req.body;
  if (!fullName || !email || !service || !message) {
    return res.status(400).json({ message: 'Missing required contact fields.' });
  }

  const id = crypto.randomBytes(8).toString('hex');
  try {
    await pool.query(
      'INSERT INTO messages (id, fullName, email, phone, service, message) VALUES (?, ?, ?, ?, ?, ?)',
      [id, fullName, email, phone, service, message]
    );
    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

app.get('/api/registrations', requireAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM registrations ORDER BY submittedAt DESC');
  res.json({ registrations: rows });
});

app.put('/api/registrations/status', requireAdmin, async (req, res) => {
  const { name, specialty, status } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE registrations SET status = ? WHERE name = ? AND specialty = ?',
      [status, name, specialty || '']
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Registration not found.' });
    res.json({ message: 'Registration status updated.', status });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status.' });
  }
});

app.get('/api/account/orders', requireUser, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders WHERE customer = ? ORDER BY submittedAt DESC', [req.session.identity.fullName]);
  res.json({ orders: rows });
});

// Serve Static Frontend (Dist Folder)
const distPath = path.join(__dirname, '../dist/power-link');
app.use(express.static(distPath));

// Fallback for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (require.main === module) {
  // Start Server
  app.listen(PORT, () => {
    console.log(`PowerLink backend listening on port ${PORT}`);
    pool.query('SELECT 1').then(() => {
      console.log('Successfully connected to MySQL database.');
    }).catch(err => {
      console.error('MySQL connection failed:', err.message);
      console.log('HINT: Check your MYSQLHOST, MYSQLUSER, MYSQLPASSWORD environment variables.');
    });
  });
}

module.exports = app;
