const express = require('express');
const { ensureAuth } = require('../middlewares/auth');
const indexController = require('../controllers/indexController');

const router = express.Router();

// home
router.get('/', ensureAuth, indexController.home);

// search
router.get('/search', ensureAuth, indexController.search);

// API: markets
router.get('/markets', indexController.marketsApi);

module.exports = router;
