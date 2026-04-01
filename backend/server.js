const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'store.json');
const ADMIN_EMAIL = process.env.POWERLINK_ADMIN_EMAIL || 'admin@powerlink.com';
const ADMIN_PASSWORD = process.env.POWERLINK_ADMIN_PASSWORD || 'PowerLink123';
const sessions = new Map();

function ensureStore() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ users: [], orders: [], registrations: [] }, null, 2)
    );
  }
}

function readStore() {
  ensureStore();

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users.map((user) => ({
        ...user,
        cart: Array.isArray(user.cart) ? user.cart : []
      })) : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      registrations: Array.isArray(parsed.registrations) ? parsed.registrations : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : []
    };
  } catch {
    return { users: [], orders: [], registrations: [], messages: [] };
  }
}

function writeStore(store) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

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
      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'));
      }
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

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
  sessions.set(token, {
    token,
    role,
    identity,
    createdAt: new Date().toISOString()
  });
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

function getCustomerRecord(store, session) {
  return store.users.find((user) => user.email === session.identity.email);
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
      sendJson(res, 200, {
        status: 'ok',
        service: 'powerlink-backend',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/register') {
      const body = await parseBody(req);
      const fullName = String(body.fullName || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const phone = String(body.phone || '').trim();
      const password = String(body.password || '');

      if (!fullName || !email || !phone || password.length < 8) {
        sendJson(res, 400, { message: 'Missing or invalid registration fields.' });
        return;
      }

      const store = readStore();
      const exists = store.users.some((user) => user.email === email);

      if (exists) {
        sendJson(res, 409, { message: 'An account with this email already exists.' });
        return;
      }

      const user = {
        id: crypto.randomBytes(8).toString('hex'),
        fullName,
        email,
        phone,
        password,
        cart: [],
        createdAt: new Date().toISOString()
      };

      store.users.push(user);
      writeStore(store);

      const token = createSession('customer', { email, fullName });
      sendJson(res, 201, {
        message: 'Account created successfully.',
        token,
        user: { fullName, email, phone }
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/auth/login') {
      const body = await parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const store = readStore();
      const user = store.users.find((entry) => entry.email === email && entry.password === password);

      if (!user) {
        sendJson(res, 401, { message: 'Invalid email or password.' });
        return;
      }

      const token = createSession('customer', { email: user.email, fullName: user.fullName });
      sendJson(res, 200, {
        message: `Welcome back, ${user.fullName}.`,
        token,
        user: {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone
        }
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/admin/login') {
      const body = await parseBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (email !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
        sendJson(res, 401, { message: 'Invalid admin credentials.' });
        return;
      }

      const token = createSession('admin', { email: ADMIN_EMAIL });
      sendJson(res, 200, {
        message: 'Admin login successful.',
        token
      });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/me') {
      const session = getSession(req);

      if (!session) {
        sendJson(res, 401, { message: 'No active session.' });
        return;
      }

      sendJson(res, 200, {
        role: session.role,
        identity: session.identity
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/orders') {
      const session = getSession(req);

      if (!session) {
        sendJson(res, 401, { message: 'Login required to create orders.' });
        return;
      }

      const body = await parseBody(req);
      const item = String(body.item || '').trim();
      const type = String(body.type || '').trim();
      const total = Number(body.total);
      const fulfillment = String(body.fulfillment || '').trim();
      const reference = String(body.reference || '').trim() || `PL-${Date.now()}`;

      if (!item || !type || Number.isNaN(total) || total < 0 || !fulfillment) {
        sendJson(res, 400, { message: 'Invalid order payload.' });
        return;
      }

      const store = readStore();
      const order = {
        reference,
        customer: session.identity.fullName || session.identity.email,
        item,
        type,
        total,
        fulfillment,
        status: type === 'Plumber Booking' ? 'Scheduled' : (fulfillment === 'Pickup' ? 'Preparing' : 'Confirmed'),
        submittedAt: new Date().toISOString()
      };

      store.orders.unshift(order);
      writeStore(store);

      sendJson(res, 201, {
        message: 'Order saved successfully.',
        order
      });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/cart') {
      const session = requireUser(req, res);

      if (!session) {
        return;
      }

      const store = readStore();
      const user = getCustomerRecord(store, session);

      if (!user) {
        sendJson(res, 404, { message: 'Customer account not found.' });
        return;
      }

      sendJson(res, 200, { items: user.cart || [] });
      return;
    }

    if (req.method === 'PUT' && pathname === '/api/cart') {
      const session = requireUser(req, res);

      if (!session) {
        return;
      }

      const body = await parseBody(req);
      const items = Array.isArray(body.items) ? body.items : null;

      if (!items) {
        sendJson(res, 400, { message: 'Invalid cart payload.' });
        return;
      }

      const validItems = items.every((item) =>
        item &&
        typeof item.name === 'string' &&
        typeof item.price === 'number' &&
        typeof item.quantity === 'number' &&
        typeof item.unit === 'string' &&
        typeof item.category === 'string' &&
        item.quantity >= 0
      );

      if (!validItems) {
        sendJson(res, 400, { message: 'Invalid cart items.' });
        return;
      }

      const store = readStore();
      const user = getCustomerRecord(store, session);

      if (!user) {
        sendJson(res, 404, { message: 'Customer account not found.' });
        return;
      }

      user.cart = items.filter((item) => item.quantity > 0);
      writeStore(store);

      sendJson(res, 200, {
        message: 'Cart saved successfully.',
        items: user.cart
      });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/orders') {
      if (!requireAdmin(req, res)) {
        return;
      }

      const store = readStore();
      sendJson(res, 200, { orders: store.orders });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/registrations') {
      const body = await parseBody(req);
      const name = String(body.name || '').trim();
      const specialty = String(body.specialty || '').trim();
      const location = String(body.location || '').trim();
      const experience = Number(body.experience);

      if (!name || !specialty || !location || Number.isNaN(experience) || experience < 0) {
        sendJson(res, 400, { message: 'Invalid registration payload.' });
        return;
      }

      const store = readStore();
      const registration = {
        name,
        specialty,
        location,
        experience,
        status: 'Pending Verification',
        submittedAt: new Date().toISOString()
      };

      store.registrations.unshift(registration);
      writeStore(store);

      sendJson(res, 201, {
        message: 'Registration submitted successfully.',
        registration
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/contact') {
      const body = await parseBody(req);
      const fullName = String(body.fullName || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const phone = String(body.phone || '').trim();
      const service = String(body.service || '').trim();
      const message = String(body.message || '').trim();

      if (!fullName || !email || !service || !message) {
        sendJson(res, 400, { message: 'Missing required contact fields.' });
        return;
      }

      const store = readStore();
      const contactMessage = {
        id: crypto.randomBytes(8).toString('hex'),
        fullName,
        email,
        phone,
        service,
        message,
        submittedAt: new Date().toISOString()
      };

      store.messages.unshift(contactMessage);
      writeStore(store);

      sendJson(res, 201, {
        message: 'Message sent successfully.',
        contactMessage
      });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/registrations') {
      if (!requireAdmin(req, res)) {
        return;
      }

      const store = readStore();
      sendJson(res, 200, { registrations: store.registrations });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/account/orders') {
      const session = requireUser(req, res);

      if (!session) {
        return;
      }

      const store = readStore();
      const orders = store.orders.filter((order) => order.customer === session.identity.fullName);
      sendJson(res, 200, { orders });
      return;
    }

    sendJson(res, 404, { message: 'Route not found.' });
  } catch (error) {
    sendJson(res, 500, {
      message: error.message || 'Unexpected server error.'
    });
  }
});

server.listen(PORT, () => {
  ensureStore();
  console.log(`PowerLink backend listening on http://127.0.0.1:${PORT}`);
});
