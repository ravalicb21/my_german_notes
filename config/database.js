const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (process.env.DB_TYPE === 'postgresql') {
        // PostgreSQL for production
        this.db = new Pool({
          connectionString: process.env.DATABASE_URL || {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
          },
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        // Test the connection
        await this.db.query('SELECT 1');
        console.log('Connected to PostgreSQL database');
      } else {
        // SQLite for development
        const dbDir = path.dirname(process.env.SQLITE_DB_PATH);
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }

        this.db = new sqlite3.Database(process.env.SQLITE_DB_PATH, (err) => {
          if (err) {
            throw err;
          }
          console.log('Connected to SQLite database');
        });
      }
      
      this.isConnected = true;
      await this.createTables();
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  async createTables() {
    const userTableQuery = process.env.DB_TYPE === 'postgresql' 
      ? `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      : `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

    const wordTableQuery = process.env.DB_TYPE === 'postgresql'
      ? `
        CREATE TABLE IF NOT EXISTS words (
          id SERIAL PRIMARY KEY,
          word VARCHAR(255) NOT NULL,
          gender VARCHAR(20),
          translation TEXT,
          notes TEXT,
          usage TEXT,
          conjugation TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      : `
        CREATE TABLE IF NOT EXISTS words (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          word TEXT NOT NULL,
          gender TEXT,
          translation TEXT,
          notes TEXT,
          usage TEXT,
          conjugation TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

    try {
      if (process.env.DB_TYPE === 'postgresql') {
        await this.db.query(userTableQuery);
        await this.db.query(wordTableQuery);
      } else {
        await new Promise((resolve, reject) => {
          this.db.run(userTableQuery, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        
        await new Promise((resolve, reject) => {
          this.db.run(wordTableQuery, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      console.log('Database tables created/verified successfully');

      // Migration: add translation column if it doesn't exist yet
      await this.addColumnIfMissing('words', 'translation', 'TEXT');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  async addColumnIfMissing(table, column, type) {
    try {
      if (process.env.DB_TYPE === 'postgresql') {
        await this.db.query(
          `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}`
        );
      } else {
        await new Promise((resolve, reject) => {
          this.db.run(
            `ALTER TABLE ${table} ADD COLUMN ${column} ${type}`,
            (err) => {
              // Ignore "duplicate column" error — column already exists
              if (err && !err.message.includes('duplicate column')) reject(err);
              else resolve();
            }
          );
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async query(sql, params = []) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    if (process.env.DB_TYPE === 'postgresql') {
      const result = await this.db.query(sql, params);
      return result.rows;
    } else {
      return new Promise((resolve, reject) => {
        if (sql.trim().toLowerCase().startsWith('select')) {
          this.db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        } else {
          this.db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          });
        }
      });
    }
  }

  async close() {
    if (this.db) {
      if (process.env.DB_TYPE === 'postgresql') {
        await this.db.end();
      } else {
        this.db.close();
      }
      this.isConnected = false;
      console.log('Database connection closed');
    }
  }
}

module.exports = new Database();