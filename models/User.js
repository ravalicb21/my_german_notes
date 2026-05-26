const bcrypt = require('bcryptjs');
const database = require('../config/database');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Create a new user
  static async create({ username, email, password }) {
    try {
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Insert user into database
      const sql = process.env.DB_TYPE === 'postgresql'
        ? 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *'
        : 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      
      const params = [username, email, hashedPassword];
      const result = await database.query(sql, params);
      
      if (process.env.DB_TYPE === 'postgresql') {
        return new User(result[0]);
      } else {
        // For SQLite, we need to fetch the created user
        const newUser = await User.findById(result.lastID);
        return newUser;
      }
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const sql = process.env.DB_TYPE === 'postgresql'
        ? 'SELECT * FROM users WHERE id = $1'
        : 'SELECT * FROM users WHERE id = ?';
      
      const result = await database.query(sql, [id]);
      
      if (result.length === 0) {
        return null;
      }
      
      return new User(result[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const sql = process.env.DB_TYPE === 'postgresql'
        ? 'SELECT * FROM users WHERE email = $1'
        : 'SELECT * FROM users WHERE email = ?';
      
      const result = await database.query(sql, [email]);
      
      if (result.length === 0) {
        return null;
      }
      
      return new User(result[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const sql = process.env.DB_TYPE === 'postgresql'
        ? 'SELECT * FROM users WHERE username = $1'
        : 'SELECT * FROM users WHERE username = ?';
      
      const result = await database.query(sql, [username]);
      
      if (result.length === 0) {
        return null;
      }
      
      return new User(result[0]);
    } catch (error) {
      throw error;
    }
  }

  // Validate password
  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Get user data without password
  toJSON() {
    const user = { ...this };
    delete user.password;
    return user;
  }

  // Update user
  async update(updateData) {
    try {
      const allowedFields = ['username', 'email'];
      const updates = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          if (process.env.DB_TYPE === 'postgresql') {
            updates.push(`${key} = $${paramIndex}`);
          } else {
            updates.push(`${key} = ?`);
          }
          values.push(value);
          paramIndex++;
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      const sql = process.env.DB_TYPE === 'postgresql'
        ? `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`
        : `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      values.push(this.id);
      const result = await database.query(sql, values);
      
      if (process.env.DB_TYPE === 'postgresql') {
        Object.assign(this, result[0]);
      } else {
        // For SQLite, fetch the updated user
        const updatedUser = await User.findById(this.id);
        Object.assign(this, updatedUser);
      }
      
      return this;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;