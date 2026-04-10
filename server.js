require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'guruglass-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 8 // 8 hours
  }
}));

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.redirect('/login');
}

// ─── Public Page Routes ───────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'products.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

// ─── Admin Page Routes ────────────────────────────────────────────────────────
app.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/admin');
  }
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// ─── Auth API ─────────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'guruglass2024';

  if (username === adminUser && password === adminPass) {
    req.session.isAdmin = true;
    req.session.username = username;
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get('/api/auth/status', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// ─── Public Products API ──────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Public Contact / Order Inquiry API ──────────────────────────────────────
app.post('/api/contact', (req, res) => {
  const { name, phone, order_description } = req.body;
  if (!name || !order_description) {
    return res.status(400).json({ error: 'Name and order description are required.' });
  }
  try {
    const stmt = db.prepare(
      'INSERT INTO clients (name, phone, order_description, status) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(name, phone || '', order_description, 'pending');
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin Products API ───────────────────────────────────────────────────────
app.get('/api/admin/products', requireAuth, (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/products', requireAuth, (req, res) => {
  const { name, description, price, youtube_url, image_url } = req.body;
  if (!name) return res.status(400).json({ error: 'Product name is required.' });
  try {
    const stmt = db.prepare(
      'INSERT INTO products (name, description, price, youtube_url, image_url) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      name,
      description || '',
      price ? parseFloat(price) : null,
      youtube_url || '',
      image_url || ''
    );
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/products/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, description, price, youtube_url, image_url } = req.body;
  if (!name) return res.status(400).json({ error: 'Product name is required.' });
  try {
    db.prepare(
      'UPDATE products SET name=?, description=?, price=?, youtube_url=?, image_url=? WHERE id=?'
    ).run(
      name,
      description || '',
      price ? parseFloat(price) : null,
      youtube_url || '',
      image_url || '',
      id
    );
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin Clients API ────────────────────────────────────────────────────────
app.get('/api/admin/clients', requireAuth, (req, res) => {
  try {
    const clients = db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/clients', requireAuth, (req, res) => {
  const { name, phone, order_description, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Client name is required.' });
  try {
    const stmt = db.prepare(
      'INSERT INTO clients (name, phone, order_description, status) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(name, phone || '', order_description || '', status || 'pending');
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/clients/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, phone, order_description, status } = req.body;
  try {
    db.prepare(
      'UPDATE clients SET name=?, phone=?, order_description=?, status=? WHERE id=?'
    ).run(name, phone || '', order_description || '', status || 'pending', id);
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/clients/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✨ GuruGlass server running on port ${PORT}`);
  console.log(`   Visit: http://localhost:${PORT}`);
  console.log(`   Admin: http://localhost:${PORT}/admin`);
});
