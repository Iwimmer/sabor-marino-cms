// ¿Tiene permiso? Se usa DESPUÉS de requireAuth.
// Ej: router.get('/users', requireAuth, requireRole('ADMIN'), controller.list)
import { AppError } from '../utils/AppError.js';

export const requireRole = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) return next(new AppError(401, 'Debes iniciar sesión'));
  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError(403, 'No tienes permiso para realizar esta acción'));
  }
  next();
};
