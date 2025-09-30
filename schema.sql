CREATE TABLE IF NOT EXISTS products(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT UNIQUE, name TEXT, price INTEGER, image TEXT, active INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS orders(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderNo TEXT UNIQUE,
  name TEXT, phone TEXT, email TEXT,
  shipping TEXT, address TEXT, payment TEXT, note TEXT,
  subtotal INTEGER, shippingFee INTEGER, total INTEGER,
  status TEXT, createdAt TEXT
);
CREATE TABLE IF NOT EXISTS order_items(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderNo TEXT, sku TEXT, name TEXT, price INTEGER, qty INTEGER
);
