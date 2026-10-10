// Rutas PÚBLICAS (sin login): las consume la web del restaurante.
import { Router } from 'express';
import * as c from '../controllers/public.controller.js';

const router = Router();
router.get('/site', c.site);
router.get('/home', c.home);
router.get('/pages', c.pages);
router.get('/pages/:slug', c.page);
router.get('/carta', c.carta);

export default router;
