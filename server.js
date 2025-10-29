const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage
let users = [];
let carts = {};
let orders = {};

// Product data with types and brands (expanded with more items and real images)
const products = {
  'Cement & Concrete': [
    { id: 1, name: 'Portland Cement 50kg', price: 12, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'Ordinary Portland Cement', brand: 'UltraTech' },
    { id: 2, name: 'Portland Cement 50kg', price: 13, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'Ordinary Portland Cement', brand: 'Ambuja' },
    { id: 3, name: 'Concrete Mix 40kg', price: 15, image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200&h=150&fit=crop', type: 'Ready Mix Concrete', brand: 'ACC' },
    { id: 4, name: 'White Cement 25kg', price: 18, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'White Portland Cement', brand: 'JK White' },
    { id: 5, name: 'White Cement 25kg', price: 19, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'White Portland Cement', brand: 'Birla White' },
    { id: 6, name: 'Rapid Hardening Cement 50kg', price: 16, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'Rapid Hardening Cement', brand: 'UltraTech' },
    { id: 7, name: 'Sulfate Resisting Cement 50kg', price: 14, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'Sulfate Resisting Cement', brand: 'Ambuja' },
    { id: 8, name: 'Pozzolana Cement 50kg', price: 11, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'Pozzolana Portland Cement', brand: 'ACC' }
  ],
  'Bricks & Blocks': [
    { id: 9, name: 'Red Clay Bricks (1000 pcs)', price: 250, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop', type: 'Clay Bricks', brand: 'Local Bricks' },
    { id: 10, name: 'Concrete Blocks', price: 2, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop', type: 'Hollow Blocks', brand: 'Hollow Block Co.' },
    { id: 11, name: 'Fly Ash Bricks (500 pcs)', price: 180, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop', type: 'Fly Ash Bricks', brand: 'Eco Bricks' },
    { id: 12, name: 'AAC Blocks', price: 3, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop', type: 'Autoclaved Aerated Concrete', brand: 'Aerocon' },
    { id: 13, name: 'Paver Blocks', price: 4, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop', type: 'Interlocking Paver Blocks', brand: 'Paver Pro' },
    { id: 14, name: 'Engineering Bricks (500 pcs)', price: 220, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop', type: 'Engineering Bricks', brand: 'Strong Build' },
    { id: 15, name: 'Refractory Bricks', price: 50, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop', type: 'Refractory Bricks', brand: 'Heat Shield' }
  ],
  'Sand & Aggregates': [
    { id: 16, name: 'M-Sand 1 Ton', price: 35, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'Manufactured Sand', brand: 'River Sand' },
    { id: 17, name: 'P-Sand 1 Ton', price: 30, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'Plastering Sand', brand: 'Fine Sand' },
    { id: 18, name: 'Gravel 20mm 1 Ton', price: 45, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'Coarse Aggregate', brand: 'Stone Aggregate' },
    { id: 19, name: 'Stone Dust 1 Ton', price: 25, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'Fine Aggregate', brand: 'Crusher Dust' },
    { id: 20, name: 'River Sand 1 Ton', price: 40, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'Natural River Sand', brand: 'Pure Sand' },
    { id: 21, name: 'Gravel 10mm 1 Ton', price: 42, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'Fine Gravel', brand: 'Stone Aggregate' },
    { id: 22, name: 'Crushed Stone 1 Ton', price: 48, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop', type: 'Crushed Aggregate', brand: 'Rock Solid' }
  ],
  'Pipes & Fittings': [
    { id: 23, name: 'PVC Pipes 4 inch', price: 8, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=150&fit=crop', type: 'PVC Plumbing Pipes', brand: 'Supreme' },
    { id: 24, name: 'PVC Pipes 4 inch', price: 9, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=150&fit=crop', type: 'PVC Plumbing Pipes', brand: 'Finolex' },
    { id: 25, name: 'Pipe Fittings Set', price: 20, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=150&fit=crop', type: 'PVC Fittings', brand: 'Ashirvad' },
    { id: 26, name: 'GI Pipes 2 inch', price: 12, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=150&fit=crop', type: 'Galvanized Iron Pipes', brand: 'Jindal' },
    { id: 27, name: 'CPVC Pipes 2 inch', price: 14, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=150&fit=crop', type: 'CPVC Hot Water Pipes', brand: 'Supreme' },
    { id: 28, name: 'HDPE Pipes 3 inch', price: 10, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=150&fit=crop', type: 'HDPE Pipes', brand: 'Finolex' },
    { id: 29, name: 'Brass Fittings Set', price: 25, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&h=150&fit=crop', type: 'Brass Pipe Fittings', brand: 'Brass Master' }
  ],
  'Steel & Metals': [
    { id: 30, name: 'Steel Rebars 12mm', price: 65, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=150&fit=crop', type: 'Reinforcement Bars', brand: 'Tata Steel' },
    { id: 31, name: 'Steel Rebars 12mm', price: 66, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=150&fit=crop', type: 'Reinforcement Bars', brand: 'JSW Steel' },
    { id: 32, name: 'Angle Iron 50mm', price: 80, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=150&fit=crop', type: 'Structural Steel', brand: 'Sail' },
    { id: 33, name: 'Steel Plates 6mm', price: 90, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=150&fit=crop', type: 'Steel Plates', brand: 'Tata Steel' },
    { id: 34, name: 'Steel Channels 100mm', price: 85, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=150&fit=crop', type: 'Steel Channels', brand: 'JSW Steel' },
    { id: 35, name: 'Steel Beams 150mm', price: 120, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=150&fit=crop', type: 'Steel Beams', brand: 'Sail' },
    { id: 36, name: 'Aluminum Sheets 2mm', price: 70, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=150&fit=crop', type: 'Aluminum Sheets', brand: 'Hindalco' }
  ],
  'Electrical': [
    { id: 37, name: 'Electrical Wires 1.5mm', price: 5, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop', type: 'Copper Wires', brand: 'Havells' },
    { id: 38, name: 'Electrical Wires 1.5mm', price: 6, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop', type: 'Copper Wires', brand: 'Polycab' },
    { id: 39, name: 'Switches & Sockets Set', price: 15, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop', type: 'Electrical Accessories', brand: 'Legrand' },
    { id: 40, name: 'LED Bulbs 10W', price: 3, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop', type: 'LED Lighting', brand: 'Philips' },
    { id: 41, name: 'MCB 32A', price: 8, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop', type: 'Miniature Circuit Breaker', brand: 'Schneider' },
    { id: 42, name: 'Conduit Pipes 1 inch', price: 4, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop', type: 'Electrical Conduit', brand: 'BEC' },
    { id: 43, name: 'Cable Ties Pack', price: 2, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop', type: 'Cable Management', brand: 'Generic' }
  ]
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/category/:name', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'category.html'));
});

app.get('/thank-you', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'thank-you.html'));
});

app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'orders.html'));
});

// API to get orders for user
app.get('/api/orders/:userId', (req, res) => {
  const { userId } = req.params;
  res.json(orders[userId] || []);
});

// API to get products for category
app.get('/api/category/:name', (req, res) => {
  const categoryName = decodeURIComponent(req.params.name);
  res.json(products[categoryName] || []);
});

// API to get types for category
app.get('/api/category/:name/types', (req, res) => {
  const categoryName = decodeURIComponent(req.params.name);
  const categoryProducts = products[categoryName] || [];
  const types = [...new Set(categoryProducts.map(p => p.type))];
  res.json(types);
});

// API to get products for category and type
app.get('/api/category/:name/:type', (req, res) => {
  const categoryName = decodeURIComponent(req.params.name);
  const typeName = decodeURIComponent(req.params.type);
  const categoryProducts = products[categoryName] || [];
  const filteredProducts = categoryProducts.filter(p => p.type === typeName);
  res.json(filteredProducts);
});

// Signup
app.post('/signup', async (req, res) => {
  const { name, phone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();
  users.push({ id: userId, name, phone, password: hashedPassword });
  carts[userId] = [];
  res.json({ success: true, userId });
});

// Login
app.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = users.find(u => u.phone === phone);
  if (user && await bcrypt.compare(password, user.password)) {
    res.json({ success: true, userId: user.id, name: user.name });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

// Add to cart
app.post('/add-to-cart', (req, res) => {
  const { userId, item } = req.body;
  if (!carts[userId]) carts[userId] = [];
  carts[userId].push(item);
  res.json({ success: true });
});

// Get cart
app.get('/cart/:userId', (req, res) => {
  const { userId } = req.params;
  res.json(carts[userId] || []);
});

// Update cart (for removing items)
app.post('/update-cart', (req, res) => {
  const { userId, items } = req.body;
  carts[userId] = items;
  res.json({ success: true });
});

// Checkout (mock payment)
app.post('/checkout', (req, res) => {
  const { userId, deliveryDate, address, paymentInfo } = req.body;
  // Mock payment processing
  console.log(`Processing payment for user ${userId}`);
  const orderId = uuidv4();
  const order = {
    id: orderId,
    userId,
    items: carts[userId] || [],
    deliveryDate,
    address,
    paymentInfo,
    date: new Date().toISOString()
  };
  if (!orders[userId]) orders[userId] = [];
  orders[userId].push(order);
  carts[userId] = []; // Clear cart
  res.json({ success: true, message: 'Order placed successfully', orderId });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
