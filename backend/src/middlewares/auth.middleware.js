// ¿Quién hace la petición? Lee el JWT de la cookie httpOnly y lo verifica.
import { AUTH_COOKIE } from '../utils/cookies.js';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import * as usersService from '../services/users.service.js';

export function requireAuth(req, _res, next) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return next(new AppError(401, 'Debes iniciar sesión'));

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(new AppError(401, 'Sesión inválida o expirada'));
  }

  // Consultamos la BD: si el usuario fue desactivado, el token deja de servir
  const user = usersService.findById(Number(payload.sub));
  if (!user || user.is_active !== 1) {
    return next(new AppError(401, 'Sesión inválida o expirada'));
  }

  req.user = usersService.toPublicUser(user);
  next();
}
