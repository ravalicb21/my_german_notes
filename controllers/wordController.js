const Word = require('../models/Word');

class WordController {
  // Get all words
  static async getAllWords(req, res) {
    try {
      const { limit, offset, search, gender } = req.query;
      let words;

      if (search) {
        words = await Word.searchByWord(search);
      } else if (gender) {
        words = await Word.findByGender(gender);
      } else {
        const parsedLimit = limit ? parseInt(limit) : null;
        const parsedOffset = offset ? parseInt(offset) : 0;
        words = await Word.findAll(parsedLimit, parsedOffset);
      }

      const totalCount = await Word.count();

      res.status(200).json({
        success: true,
        data: words,
        totalCount,
        message: 'Words retrieved successfully'
      });
    } catch (error) {
      console.error('Get words error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving words',
        error: error.message
      });
    }
  }

  // Get word by ID
  static async getWordById(req, res) {
    try {
      const { id } = req.params;
      const word = await Word.findById(id);

      if (!word) {
        return res.status(404).json({
          success: false,
          message: 'Word not found'
        });
      }

      res.status(200).json({
        success: true,
        data: word,
        message: 'Word retrieved successfully'
      });
    } catch (error) {
      console.error('Get word by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving word',
        error: error.message
      });
    }
  }

  // Create new word
  static async createWord(req, res) {
    try {
      const { word, gender, translation, notes, usage, conjugation } = req.body;

      // Validate required fields
      if (!word || word.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Word is required'
        });
      }

      // Validate gender if provided
      const validGenders = ['der', 'die', 'das'];
      if (gender && !validGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Gender must be one of: der, die, das'
        });
      }

      const newWord = await Word.create({
        word: word.trim(),
        gender: gender ? gender.toLowerCase() : null,
        translation: translation ? translation.trim() : null,
        notes: notes ? notes.trim() : null,
        usage: usage ? usage.trim() : null,
        conjugation: conjugation ? conjugation.trim() : null
      });

      res.status(201).json({
        success: true,
        data: newWord,
        message: 'Word created successfully'
      });
    } catch (error) {
      console.error('Create word error:', error);
      
      // Handle duplicate word errors
      if (error.message.includes('UNIQUE constraint') || error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Word already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating word',
        error: error.message
      });
    }
  }

  // Update word
  static async updateWord(req, res) {
    try {
      const { id } = req.params;
      const { word, gender, translation, notes, usage, conjugation } = req.body;

      const existingWord = await Word.findById(id);
      if (!existingWord) {
        return res.status(404).json({
          success: false,
          message: 'Word not found'
        });
      }

      // Validate word if provided
      if (word !== undefined && (!word || word.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'Word cannot be empty'
        });
      }

      // Validate gender if provided
      const validGenders = ['der', 'die', 'das'];
      if (gender && !validGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Gender must be one of: der, die, das'
        });
      }

      const updateData = {};
      if (word !== undefined) updateData.word = word.trim();
      if (gender !== undefined) updateData.gender = gender ? gender.toLowerCase() : null;
      if (translation !== undefined) updateData.translation = translation ? translation.trim() : null;
      if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;
      if (usage !== undefined) updateData.usage = usage ? usage.trim() : null;
      if (conjugation !== undefined) updateData.conjugation = conjugation ? conjugation.trim() : null;

      const updatedWord = await existingWord.update(updateData);

      res.status(200).json({
        success: true,
        data: updatedWord,
        message: 'Word updated successfully'
      });
    } catch (error) {
      console.error('Update word error:', error);
      
      // Handle duplicate word errors
      if (error.message.includes('UNIQUE constraint') || error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Word already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating word',
        error: error.message
      });
    }
  }

  // Delete word
  static async deleteWord(req, res) {
    try {
      const { id } = req.params;

      const word = await Word.findById(id);
      if (!word) {
        return res.status(404).json({
          success: false,
          message: 'Word not found'
        });
      }

      await word.delete();

      res.status(200).json({
        success: true,
        message: 'Word deleted successfully'
      });
    } catch (error) {
      console.error('Delete word error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting word',
        error: error.message
      });
    }
  }

  // Search words
  static async searchWords(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const words = await Word.searchByWord(q.trim());

      res.status(200).json({
        success: true,
        data: words,
        count: words.length,
        message: 'Search completed successfully'
      });
    } catch (error) {
      console.error('Search words error:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching words',
        error: error.message
      });
    }
  }

  // Get words by gender
  static async getWordsByGender(req, res) {
    try {
      const { gender } = req.params;
      const validGenders = ['der', 'die', 'das'];

      if (!validGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid gender. Must be one of: der, die, das'
        });
      }

      const words = await Word.findByGender(gender.toLowerCase());

      res.status(200).json({
        success: true,
        data: words,
        count: words.length,
        message: `Words with gender '${gender}' retrieved successfully`
      });
    } catch (error) {
      console.error('Get words by gender error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving words by gender',
        error: error.message
      });
    }
  }

  // Get word statistics
  static async getWordStats(req, res) {
    try {
      const totalWords = await Word.count();
      const derWords = await Word.findByGender('der');
      const dieWords = await Word.findByGender('die');
      const dasWords = await Word.findByGender('das');

      res.status(200).json({
        success: true,
        data: {
          total: totalWords,
          byGender: {
            der: derWords.length,
            die: dieWords.length,
            das: dasWords.length,
            unknown: totalWords - (derWords.length + dieWords.length + dasWords.length)
          }
        },
        message: 'Word statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Get word stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving word statistics',
        error: error.message
      });
    }
  }
}

module.exports = WordController;