const http = require('http');
const crypto = require('crypto');
const { URL } = require('url');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 3001;
const ADMIN_EMAIL = process.env.POWERLINK_ADMIN_EMAIL || 'admin@powerlink.com';
const ADMIN_PASSWORD = process.env.POWERLINK_ADMIN_PASSWORD || 'PowerLink123';
const sessions = new Map();

// MySQL Connection Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'RroJjWAayNeE1@13',
  database: 'powerlink',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

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

function handleOptions(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end();
}

function requireAdmin(req, res) {
  const session = getSession(req);
  if (!session || session.role !== 'admin') {
    sendJson(res, 401, { message: 'Admin authorization required.' });
    return null;
  }
  return session;
}

function requireUser(req, res) {
  const session = getSession(req);
  if (!session || session.role !== 'customer') {
    sendJson(res, 401, { message: 'Customer authorization required.' });
    return null;
  }
  return session;
}

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { message: 'Invalid request.' });
    return;
  }
  if (req.method === 'OPTIONS') {
    handleOptions(res);
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    if (req.method === 'GET' && pathname === '/api/health') {
      sendJson(res, 200, { status: 'ok', service: 'powerlink-backend-mysql', timestamp: new Date().toISOString() });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/register') {
      const body = await parseBody(req);
      const fullName = String(body.fullName || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const phone = String(body.phone || '').trim();
      const password = String(body.password || '');

      if (!fullName || !email || !phone || password.length < 8) {
        return sendJson(res, 400, { message: 'Missing or invalid registration fields.' });
      }

      const [rows] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
      if (rows.length > 0) {
        return sendJson(res, 409, { message: 'An account with this email already exists.' });
      }

      const id = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await pool.query(
        'INSERT INTO users (id, fullName, email, phone, password, cart) VALUES (?, ?, ?, ?, ?, ?)',
        [id, fullName, email, phone, hashedPassword, JSON.stringify([])]
      );

      const token = createSession('customer', { email, fullName });
      return sendJson(res, 201, { message: 'Account created successfully.', token, user: { fullName, email, phone } });
    }

    if (req.method === 'POST' && pathname === '/api/auth/login') {
      const body = await parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      const user = rows[0];

      if (!user) {
        return sendJson(res, 401, { message: 'Invalid email or password.' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return sendJson(res, 401, { message: 'Invalid email or password.' });
      }

      const token = createSession('customer', { email: user.email, fullName: user.fullName });
      return sendJson(res, 200, {
        message: `Welcome back, ${user.fullName}.`,
        token,
        user: { fullName: user.fullName, email: user.email, phone: user.phone }
      });
    }

    if (req.method === 'POST' && pathname === '/api/admin/login') {
      const body = await parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (email !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
        return sendJson(res, 401, { message: 'Invalid admin credentials.' });
      }
      const token = createSession('admin', { email: ADMIN_EMAIL });
      return sendJson(res, 200, { message: 'Admin login successful.', token });
    }

    if (req.method === 'GET' && pathname === '/api/me') {
      const session = getSession(req);
      if (!session) return sendJson(res, 401, { message: 'No active session.' });
      return sendJson(res, 200, { role: session.role, identity: session.identity });
    }

    if (req.method === 'POST' && pathname === '/api/orders') {
      const session = getSession(req);
      if (!session) return sendJson(res, 401, { message: 'Login required to create orders.' });

      const body = await parseBody(req);
      const item = String(body.item || '').trim();
      const type = String(body.type || '').trim();
      const total = Number(body.total);
      const fulfillment = String(body.fulfillment || '').trim();
      const reference = String(body.reference || '').trim() || `PL-${Date.now()}`;

      if (!item || !type || Number.isNaN(total) || total < 0 || !fulfillment) {
        return sendJson(res, 400, { message: 'Invalid order payload.' });
      }

      const customerName = session.identity.fullName || session.identity.email;
      const status = type === 'Plumber Booking' ? 'Scheduled' : (fulfillment === 'Pickup' ? 'Preparing' : 'Confirmed');

      await pool.query(
        'INSERT INTO orders (reference, customer, item, type, total, fulfillment, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [reference, customerName, item, type, total, fulfillment, status]
      );

      return sendJson(res, 201, {
        message: 'Order saved successfully.',
        order: { reference, customer: customerName, item, type, total, fulfillment, status, submittedAt: new Date().toISOString() }
      });
    }

    if (req.method === 'GET' && pathname === '/api/cart') {
      const session = requireUser(req, res);
      if (!session) return;

      const [rows] = await pool.query('SELECT cart FROM users WHERE email = ?', [session.identity.email]);
      if (rows.length === 0) return sendJson(res, 404, { message: 'Customer account not found.' });
      
      const cartItems = typeof rows[0].cart === 'string' ? JSON.parse(rows[0].cart) : rows[0].cart;
      return sendJson(res, 200, { items: cartItems || [] });
    }

    if (req.method === 'PUT' && pathname === '/api/cart') {
      const session = requireUser(req, res);
      if (!session) return;

      const body = await parseBody(req);
      const items = Array.isArray(body.items) ? body.items : null;
      if (!items) return sendJson(res, 400, { message: 'Invalid cart payload.' });

      const validItems = items.every((item) =>
        item && typeof item.name === 'string' && typeof item.price === 'number' &&
        typeof item.quantity === 'number' && typeof item.unit === 'string' &&
        typeof item.category === 'string' && item.quantity >= 0
      );

      if (!validItems) return sendJson(res, 400, { message: 'Invalid cart items.' });

      const cartData = items.filter((item) => item.quantity > 0);
      const [result] = await pool.query('UPDATE users SET cart = ? WHERE email = ?', [JSON.stringify(cartData), session.identity.email]);
      
      if (result.affectedRows === 0) return sendJson(res, 404, { message: 'Customer account not found.' });

      return sendJson(res, 200, { message: 'Cart saved successfully.', items: cartData });
    }

    if (req.method === 'GET' && pathname === '/api/orders') {
      if (!requireAdmin(req, res)) return;
      const [rows] = await pool.query('SELECT * FROM orders ORDER BY submittedAt DESC');
      return sendJson(res, 200, { orders: rows });
    }

    if (req.method === 'POST' && pathname === '/api/registrations') {
      const body = await parseBody(req);
      const name = String(body.name || '').trim();
      const specialty = String(body.specialty || '').trim();
      const location = String(body.location || '').trim();
      const experience = Number(body.experience);

      if (!name || !specialty || !location || Number.isNaN(experience) || experience < 0) {
        return sendJson(res, 400, { message: 'Invalid registration payload.' });
      }

      await pool.query(
        'INSERT INTO registrations (name, specialty, location, experience, status) VALUES (?, ?, ?, ?, ?)',
        [name, specialty, location, experience, 'Pending Verification']
      );

      return sendJson(res, 201, {
        message: 'Registration submitted successfully.',
        registration: { name, specialty, location, experience, status: 'Pending Verification', submittedAt: new Date().toISOString() }
      });
    }

    if (req.method === 'POST' && pathname === '/api/contact') {
      const body = await parseBody(req);
      const fullName = String(body.fullName || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const phone = String(body.phone || '').trim();
      const service = String(body.service || '').trim();
      const message = String(body.message || '').trim();

      if (!fullName || !email || !service || !message) {
        return sendJson(res, 400, { message: 'Missing required contact fields.' });
      }

      const id = crypto.randomBytes(8).toString('hex');
      await pool.query(
        'INSERT INTO messages (id, fullName, email, phone, service, message) VALUES (?, ?, ?, ?, ?, ?)',
        [id, fullName, email, phone, service, message]
      );

      return sendJson(res, 201, {
        message: 'Message sent successfully.',
        contactMessage: { id, fullName, email, phone, service, message, submittedAt: new Date().toISOString() }
      });
    }

    if (req.method === 'GET' && pathname === '/api/registrations') {
      if (!requireAdmin(req, res)) return;
      const [rows] = await pool.query('SELECT * FROM registrations ORDER BY submittedAt DESC');
      return sendJson(res, 200, { registrations: rows });
    }

    if (req.method === 'PUT' && pathname === '/api/registrations/status') {
      if (!requireAdmin(req, res)) return;
      const body = await parseBody(req);
      const { name, specialty, status } = body;
      
      if (!name || !specialty || !status) {
        return sendJson(res, 400, { message: 'Missing required status update fields.' });
      }

      const [result] = await pool.query(
        'UPDATE registrations SET status = ? WHERE name = ? AND specialty = ?',
        [status, name, body.specialty || '']
      );

      if (result.affectedRows === 0) {
        return sendJson(res, 404, { message: 'Registration not found.' });
      }

      return sendJson(res, 200, { message: 'Registration status updated.', status });
    }

    if (req.method === 'GET' && pathname === '/api/account/orders') {
      const session = requireUser(req, res);
      if (!session) return;
      const [rows] = await pool.query('SELECT * FROM orders WHERE customer = ? ORDER BY submittedAt DESC', [session.identity.fullName]);
      return sendJson(res, 200, { orders: rows });
    }

    sendJson(res, 404, { message: 'Route not found.' });
  } catch (error) {
    console.error('Server error:', error);
    sendJson(res, 500, { message: 'Unexpected server error. ' + error.message });
  }
});

server.listen(PORT, () => {
  pool.query('SELECT 1').then(() => {
    console.log(`PowerLink backend connected to MySQL and listening on http://127.0.0.1:${PORT}`);
  }).catch(e => {
    console.error(`Failed to connect to MySQL:`, e);
  });
});
