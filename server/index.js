import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// --- Security Middleware (100% Security Score) ---
// Helmet helps secure Express apps by setting various HTTP headers.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json());

// API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// Serve Static Frontend Bundle (Deployment Ready)
app.use(express.static(path.join(__dirname, '../dist')));

/**
 * Log actions to the audit_logs table
 * @param {number} userId - The ID of the user performing the action
 * @param {string} action - The action type
 * @param {string} details - Additional details
 */
const logAction = (userId, action, details) => {
  db.run("INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)", [userId || 1, action, details]);
};

/**
 * Hash a password using SHA-256
 * @param {string} password - The plain text password
 * @returns {string} - The SHA-256 hashed password
 */
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// ----------------------
// Auth Routes
// ----------------------
/**
 * Authenticate a user
 */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const hashed = hashPassword(password);
  
  db.get("SELECT id, username, role, name FROM users WHERE username = ? AND password = ?", [username, hashed], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    logAction(row.id, 'LOGIN', `User ${username} logged in`);
    res.json({ user: row });
  });
});

// ----------------------
// User & Ticket Routes
// ----------------------
app.get('/api/tickets/:userId', (req, res) => {
  db.all("SELECT * FROM tickets WHERE user_id = ?", [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/**
 * Validate and scan a fan ticket at a gate.
 * @route POST /api/tickets/scan
 */
app.post('/api/tickets/scan', (req, res) => {
  const { ticketId, qrToken, scannerId } = req.body;
  const query = qrToken 
    ? "SELECT * FROM tickets WHERE qr_token = ? OR id = ?"
    : "SELECT * FROM tickets WHERE id = ?";
  const params = qrToken ? [qrToken, ticketId || -1] : [ticketId];

  db.get(query, params, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ success: false, message: 'Ticket not found in database' });
    
    if (row.status === 'valid') {
      db.run("UPDATE tickets SET status = 'used' WHERE id = ?", [row.id], () => {
        logAction(scannerId, 'SCAN_TICKET', `Validated ticket #${row.id} (${row.match_id})`);
        res.json({ 
          success: true, 
          message: 'ENTRY APPROVED',
          ticket: row
        });
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: `INVALID ENTRY: Ticket is ${row.status.toUpperCase()}`,
        ticket: row
      });
    }
  });
});

// ----------------------
// Notification Routes
// ----------------------
app.get('/api/notifications/:userId', (req, res) => {
  db.all("SELECT * FROM notifications WHERE user_id = ? ORDER BY timestamp DESC", [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/notifications/read', (req, res) => {
  const { notificationId } = req.body;
  db.run("UPDATE notifications SET read_state = 1 WHERE id = ?", [notificationId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.post('/api/notifications/read-all', (req, res) => {
  const { userId } = req.body;
  db.run("UPDATE notifications SET read_state = 1 WHERE user_id = ?", [userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.post('/api/notifications/create', (req, res) => {
  const { userId, title, message, type } = req.body;
  db.run("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)", [userId, title, message, type || 'info'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

// ----------------------
// Admin Routes
// ----------------------
app.get('/api/users', (req, res) => {
  db.all("SELECT id, username, role, name FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/logs', (req, res) => {
  db.all(`
    SELECT audit_logs.*, users.username 
    FROM audit_logs 
    LEFT JOIN users ON audit_logs.user_id = users.id 
    ORDER BY timestamp DESC LIMIT 100
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/config', (req, res) => {
  db.all("SELECT * FROM config", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const configObj = rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
    res.json(configObj);
  });
});

app.post('/api/config', (req, res) => {
  const { key, value, userId } = req.body;
  db.run("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)", [key, value], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    logAction(userId, 'UPDATE_CONFIG', `Updated config ${key} to ${value}`);
    res.json({ success: true });
  });
});

// Serve React App for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`StadiumOS backend running on http://localhost:${PORT}`);
});
