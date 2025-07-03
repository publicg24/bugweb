// Entry point for Express backend using SQLite
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// SQLite DB setup
const dbFile = path.join(__dirname, 'photoapp.sqlite');
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    user_id INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// Multer setup
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Auth middleware
function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// Auth routes
app.post('/api/auth/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('DB error on signup:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (user) return res.status(400).json({ message: 'User already exists' });
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Bcrypt error:', err);
        return res.status(500).json({ message: 'Password hashing failed' });
      }
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function (err) {
        if (err) {
          console.error('DB error on insert:', err);
          return res.status(500).json({ message: 'Signup failed' });
        }
        res.status(201).json({ message: 'User created' });
      });
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    console.log('Login attempt missing username or password');
    return res.status(400).json({ message: 'Username and password are required' });
  }
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('DB error on login:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (!user) {
      console.log('Login failed: user not found:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Bcrypt error:', err);
        return res.status(500).json({ message: 'Password check failed' });
      }
      if (!isMatch) {
        console.log('Login failed: password mismatch for user:', username);
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
      console.log('Login successful for user:', username);
      res.json({ token });
    });
  });
});

// Photo upload route
app.post('/api/photos/upload', auth, upload.single('photo'), (req, res) => {
  const url = `/uploads/${req.file.filename}`;
  db.run('INSERT INTO photos (url, user_id) VALUES (?, ?)', [url, req.user], function (err) {
    if (err) return res.status(500).json({ message: 'Upload failed' });
    res.status(201).json({ id: this.lastID, url });
  });
});

// Get user photos
app.get('/api/photos', auth, (req, res) => {
  db.all('SELECT * FROM photos WHERE user_id = ? ORDER BY createdAt DESC', [req.user], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch photos' });
    res.json(rows);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
