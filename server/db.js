import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'stadiumos.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database.');
    db.serialize(() => {
      // Users Table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        name TEXT
      )`);

      // Tickets Table
      db.run(`CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        match_id TEXT,
        seat TEXT,
        gate TEXT,
        status TEXT,
        qr_token TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // Notifications Table
      db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        message TEXT,
        type TEXT,
        read_state INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Audit Logs Table
      db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        details TEXT
      )`);

      // Stadium Config Table
      db.run(`CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
      )`);

      // User Preferences Table
      db.run(`CREATE TABLE IF NOT EXISTS user_preferences (
        user_id INTEGER PRIMARY KEY,
        language TEXT DEFAULT 'English',
        accessibility_settings TEXT DEFAULT '{}',
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`);

      // Add Index for Performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id)`);

      // Seed Initial Data
      db.get("SELECT COUNT(*) AS count FROM users", async (err, row) => {
        if (!row || row.count === 0) {
          const crypto = (await import('crypto')).default;
          const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');
          
          const insertUser = db.prepare("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)");
          insertUser.run("admin", hashPassword("admin123"), "Admin", "System Administrator");
          insertUser.run("ops", hashPassword("ops123"), "Ops", "Operations Manager");
          insertUser.run("volunteer", hashPassword("vol123"), "Volunteer", "Gate Volunteer");
          insertUser.run("fan", hashPassword("fan123"), "Fan", "Football Fan");
          insertUser.finalize();
          console.log("Seeded initial users with hashed passwords.");
          
          // Seed ticket with QR token
          db.run("INSERT INTO tickets (user_id, match_id, seat, gate, status, qr_token) VALUES (?, ?, ?, ?, ?, ?)", 
            [4, "M1-WC26 (USA vs MEX)", "Sec 102, Row F, Seat 14", "Gate A", "valid", "STADIUMOS-WC26-FAN-102F14"]);

          // Seed sample notifications
          db.run("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
            [4, "Gate A Congestion Alert", "Gate A is currently experiencing high crowd density. Consider using Gate C.", "alert"]);
          db.run("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
            [4, "Match Schedule Update", "Opening Match Kickoff confirmed at 20:00 EST.", "info"]);

          db.run("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
            [2, "Operational Alert: Gate B", "Gate B wait time exceeded 12 mins. AI recommended fan rerouting to Gate C.", "warning"]);
          
          // Seed initial config
          db.run("INSERT INTO config (key, value) VALUES (?, ?)", ["stadium_name", "FIFA World Cup 2026 MetLife Arena"]);
          db.run("INSERT INTO config (key, value) VALUES (?, ?)", ["capacity", "82500"]);
          db.run("INSERT INTO config (key, value) VALUES (?, ?)", ["ai_mode", "strict"]);
        }
      });
    });
  }
});

export default db;
