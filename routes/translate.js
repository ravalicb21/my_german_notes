const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/', authenticateToken, async (req, res) => {
  const { word } = req.body;

  if (!word || word.trim() === '') {
    return res.status(400).json({ success: false, message: 'Word is required' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Translate the German word "${word.trim()}" to English. Reply with only the English translation — no explanation, no punctuation, just the word or short phrase.`
        }
      ]
    });

    const translation = message.content[0]?.text?.trim() || '';
    res.json({ success: true, translation });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ success: false, message: 'Translation failed' });
  }
});

module.exports = router;
