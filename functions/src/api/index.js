const express = require('express');

const emojis = require('./emojis');
const leaderboards = require('./leaderboards');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.use('/emojis', emojis);
router.use('/leaderboards', leaderboards);

module.exports = router;
