import express from 'express';
import { ensureAuth } from '../middlewares/auth';
import * as indexController from '../controllers/indexController';

const router = express.Router();

router.get('/', ensureAuth, indexController.home);
router.get('/search', ensureAuth, indexController.search);
router.get('/markets', indexController.marketsApi);
router.get('/favori', ensureAuth, indexController.favori);
router.post('/favori', ensureAuth, indexController.toggleFavori);

export default router;