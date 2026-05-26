const express = require('express');
const WordController = require('../controllers/wordController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all word routes
router.use(authenticateToken);

// GET /api/words - Get all words (with optional filtering and pagination)
// Query parameters: limit, offset, search, gender
router.get('/', WordController.getAllWords);

// GET /api/words/stats - Get word statistics
router.get('/stats', WordController.getWordStats);

// GET /api/words/search - Search words
// Query parameter: q (search query)
router.get('/search', WordController.searchWords);

// GET /api/words/gender/:gender - Get words by gender (der, die, das)
router.get('/gender/:gender', WordController.getWordsByGender);

// GET /api/words/:id - Get word by ID
router.get('/:id', WordController.getWordById);

// POST /api/words - Create new word
router.post('/', WordController.createWord);

// PUT /api/words/:id - Update word
router.put('/:id', WordController.updateWord);

// DELETE /api/words/:id - Delete word
router.delete('/:id', WordController.deleteWord);

module.exports = router;