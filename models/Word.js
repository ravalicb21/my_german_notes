const database = require('../config/database');

class Word {
  constructor(wordData) {
    this.id = wordData.id;
    this.word = wordData.word;
    this.gender = wordData.gender;
    this.translation = wordData.translation;
    this.notes = wordData.notes;
    this.usage = wordData.usage;
    this.conjugation = wordData.conjugation;
    this.created_at = wordData.created_at;
    this.updated_at = wordData.updated_at;
  }

  // Create a new word
  static async create({ word, gender, translation, notes, usage, conjugation }) {
    try {
      const sql = process.env.DB_TYPE === 'postgresql'
        ? 'INSERT INTO words (word, gender, translation, notes, usage, conjugation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
        : 'INSERT INTO words (word, gender, translation, notes, usage, conjugation) VALUES (?, ?, ?, ?, ?, ?)';

      const params = [word, gender || null, translation || null, notes || null, usage || null, conjugation || null];
      const result = await database.query(sql, params);
      
      if (process.env.DB_TYPE === 'postgresql') {
        return new Word(result[0]);
      } else {
        // For SQLite, we need to fetch the created word
        const newWord = await Word.findById(result.lastID);
        return newWord;
      }
    } catch (error) {
      throw error;
    }
  }

  // Find word by ID
  static async findById(id) {
    try {
      const sql = process.env.DB_TYPE === 'postgresql'
        ? 'SELECT * FROM words WHERE id = $1'
        : 'SELECT * FROM words WHERE id = ?';
      
      const result = await database.query(sql, [id]);
      
      if (result.length === 0) {
        return null;
      }
      
      return new Word(result[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find all words
  static async findAll(limit = null, offset = 0) {
    try {
      let sql = 'SELECT * FROM words ORDER BY created_at DESC';
      const params = [];
      
      if (limit) {
        if (process.env.DB_TYPE === 'postgresql') {
          sql += ' LIMIT $1 OFFSET $2';
          params.push(limit, offset);
        } else {
          sql += ' LIMIT ? OFFSET ?';
          params.push(limit, offset);
        }
      }
      
      const result = await database.query(sql, params);
      return result.map(wordData => new Word(wordData));
    } catch (error) {
      throw error;
    }
  }

  // Search words by word text
  static async searchByWord(searchTerm) {
    try {
      const sql = process.env.DB_TYPE === 'postgresql'
        ? 'SELECT * FROM words WHERE word ILIKE $1 ORDER BY word ASC'
        : 'SELECT * FROM words WHERE word LIKE ? COLLATE NOCASE ORDER BY word ASC';
      
      const searchPattern = `%${searchTerm}%`;
      const result = await database.query(sql, [searchPattern]);
      
      return result.map(wordData => new Word(wordData));
    } catch (error) {
      throw error;
    }
  }

  // Find words by gender
  static async findByGender(gender) {
    try {
      const sql = process.env.DB_TYPE === 'postgresql'
        ? 'SELECT * FROM words WHERE gender = $1 ORDER BY word ASC'
        : 'SELECT * FROM words WHERE gender = ? ORDER BY word ASC';
      
      const result = await database.query(sql, [gender]);
      return result.map(wordData => new Word(wordData));
    } catch (error) {
      throw error;
    }
  }

  // Update word
  async update(updateData) {
    try {
      const allowedFields = ['word', 'gender', 'translation', 'notes', 'usage', 'conjugation'];
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
        ? `UPDATE words SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`
        : `UPDATE words SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      values.push(this.id);
      const result = await database.query(sql, values);
      
      if (process.env.DB_TYPE === 'postgresql') {
        Object.assign(this, result[0]);
      } else {
        // For SQLite, fetch the updated word
        const updatedWord = await Word.findById(this.id);
        Object.assign(this, updatedWord);
      }
      
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Delete word
  async delete() {
    try {
      const sql = process.env.DB_TYPE === 'postgresql'
        ? 'DELETE FROM words WHERE id = $1'
        : 'DELETE FROM words WHERE id = ?';
      
      await database.query(sql, [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Static delete method
  static async deleteById(id) {
    try {
      const sql = process.env.DB_TYPE === 'postgresql'
        ? 'DELETE FROM words WHERE id = $1'
        : 'DELETE FROM words WHERE id = ?';
      
      const result = await database.query(sql, [id]);
      
      if (process.env.DB_TYPE === 'postgresql') {
        return result.length > 0;
      } else {
        return result.changes > 0;
      }
    } catch (error) {
      throw error;
    }
  }

  // Get count of all words
  static async count() {
    try {
      const sql = 'SELECT COUNT(*) as count FROM words';
      const result = await database.query(sql);
      return result[0].count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Word;