// Combinaciones de protección reutilizables en las rutas.
import { requireAuth } from './auth.middleware.js';
import { requireRole } from './role.middleware.js';

export const anyStaff = [requireAuth, requireRole('ADMIN', 'EDITOR')]; // contenido: páginas, carta, menús, medios
export const adminOnly = [requireAuth, requireRole('ADMIN')];          // apariencia y usuarios
