// Controlador de autenticación: SOLO maneja HTTP (lee req, responde res).
// La lógica está en auth.service.js
import * as authService from '../services/auth.service.js';
import { AUTH_COOKIE, authCookieOptions } from '../utils/cookies.js';

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  const { token, user } = await authService.login(email, password);

  // El token NO se manda en el JSON: va en una cookie httpOnly
  res.cookie(AUTH_COOKIE, token, authCookieOptions);
  res.json({ data: { user } });
}

// POST /api/auth/logout
export function logout(_req, res) {
  const { maxAge, ...options } = authCookieOptions;
  res.clearCookie(AUTH_COOKIE, options);
  res.json({ data: { message: 'Sesión cerrada' } });
}

// GET /api/auth/me
export function me(req, res) {
  res.json({ data: { user: req.user } });
}
