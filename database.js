// GuruGlass Database Module
// Uses Node.js 22+ built-in sqlite (no external dependencies needed)

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'guruglass.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys for better performance & integrity
db.exec("PRAGMA journal_mode=WAL");
db.exec("PRAGMA foreign_keys=ON");

// ─── Create Tables ────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    name        TEXT     NOT NULL,
    description TEXT     DEFAULT '',
    price       REAL,
    youtube_url TEXT     DEFAULT '',
    image_url   TEXT     DEFAULT '',
    created_at  DATETIME DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS clients (
    id                INTEGER  PRIMARY KEY AUTOINCREMENT,
    name              TEXT     NOT NULL,
    phone             TEXT     DEFAULT '',
    order_description TEXT     DEFAULT '',
    status            TEXT     DEFAULT 'pending' CHECK(status IN ('pending','complete')),
    created_at        DATETIME DEFAULT (datetime('now'))
  );
`);

// ─── Seed sample data if products table is empty ──────────────────────────────
const countRow = db.prepare('SELECT COUNT(*) AS c FROM products').get();
const productCount = countRow ? countRow.c : 0;

if (productCount === 0) {
  const insert = db.prepare(
    'INSERT INTO products (name, description, price, youtube_url, image_url) VALUES (?, ?, ?, ?, ?)'
  );

  db.exec('BEGIN');
  try {
    insert.run(
      'Aurora Pendant',
      'A breathtaking hand-blown glass pendant capturing the swirling colors of the northern lights. Deep teal meets violet in this one-of-a-kind wearable art piece.',
      285,
      '',
      'https://images.unsplash.com/photo-1599714685195-ce0c7fe72ab6?w=800&q=80'
    );
    insert.run(
      'Solar Flare Sculpture',
      'Massive freestanding sculpture in amber and gold, inspired by the raw energy of the sun. 18 inches of pure molten artistry.',
      1200,
      '',
      'https://images.unsplash.com/photo-1602526214953-a8b9e5f85df7?w=800&q=80'
    );
    insert.run(
      'Ocean Vessel',
      'A wide-mouth vase in layered aquamarine and sea-foam, each piece unique as the ocean itself. Perfect for botanicals or as standalone art.',
      450,
      '',
      'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800&q=80'
    );
    insert.run(
      'Ember Series — Orb Set',
      'A trio of nested glass orbs in deep crimson fading to burnt orange. Display together or separately. Each sold as a complete set.',
      680,
      '',
      'https://images.unsplash.com/photo-1612012373965-aa2028396f19?w=800&q=80'
    );
    db.exec('COMMIT');
    console.log('✅ Database seeded with sample products.');
  } catch(err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

module.exports = db;
