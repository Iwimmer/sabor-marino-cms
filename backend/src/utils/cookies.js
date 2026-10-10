// Opciones de la cookie donde viaja el JWT.
import { env } from '../config/env.js';

export const AUTH_COOKIE = 'sm_token';

// Convierte "8h", "30m", "1d" o "3600s" a milisegundos (la cookie dura lo mismo que el JWT)
function toMs(value) {
  const m = /^(\d+)\s*([smhd])$/.exec(String(value).trim());
  if (!m) return 8 * 60 * 60 * 1000;
  return Number(m[1]) * { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }[m[2]];
}

export const authCookieOptions = {
  httpOnly: true,            // JavaScript del navegador NO puede leerla (protege contra XSS)
  secure: env.isProd,        // en producción solo viaja por HTTPS
  sameSite: 'lax',           // no se envía desde otros sitios en peticiones POST (protege contra CSRF)
  maxAge: toMs(env.jwtExpiresIn), // misma duración que el JWT (JWT_EXPIRES_IN)
  path: '/',
};
