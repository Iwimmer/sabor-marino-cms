// Punto central donde se registran todas las rutas de la API.
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import publicRoutes from './public.routes.js';
import menusRoutes from './menus.routes.js';
import mediaRoutes from './media.routes.js';
import { settingsRouter, socialRouter } from './settings.routes.js';
import { pagesRouter, componentsRouter } from './pages.routes.js';
import { categoriesRouter, dishesRouter } from './carta.routes.js';
import { anyStaff } from '../middlewares/roles.js';
import * as stats from '../controllers/stats.controller.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ data: { status: 'ok', time: new Date().toISOString() } }));

// Públicas
router.use('/public', publicRoutes);
router.use('/auth', authRoutes);

// Panel de administración (protegidas)
router.use('/settings', settingsRouter);
router.use('/social-links', socialRouter);
router.use('/menus', menusRoutes);
router.use('/pages', pagesRouter);
router.use('/components', componentsRouter);
router.use('/categories', categoriesRouter);
router.use('/dishes', dishesRouter);
router.use('/media', mediaRoutes);
router.use('/users', usersRoutes);
router.get('/stats', anyStaff, stats.summary);

export default router;
