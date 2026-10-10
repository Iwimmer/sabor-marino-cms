// Peticiones desde el SERVIDOR de Next.js (Server Components) hacia la API Express.
// Van directo a API_URL (no pasan por el navegador) y sin caché: si el admin cambia
// algo, la siguiente visita ya lo muestra.
import 'server-only';
import { unstable_rethrow } from 'next/navigation';
import { DEFAULT_COLORS } from './colors';

const API_URL = process.env.API_URL || 'http://localhost:4000';

export async function apiGet(path) {
  const res = await fetch(`${API_URL}/api${path}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`La API respondió ${res.status} en ${path}`);
  return (await res.json()).data;
}

/**
 * Petición CON la sesión del usuario (para Server Components del panel).
 * Reenvía la cookie httpOnly que llegó del navegador a la API.
 */
export async function apiGetAsUser(path) {
  const { cookies } = await import('next/headers');
  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${API_URL}/api${path}`, { cache: 'no-store', headers: { cookie: cookieHeader } });
  if (!res.ok) throw new Error(`La API respondió ${res.status} en ${path}`);
  return (await res.json()).data;
}

/** Datos del layout. Si la API no responde, devuelve valores por defecto para no romper la página. */
export async function getSite() {
  try {
    return await apiGet('/public/site');
  } catch (err) {
    unstable_rethrow(err); // deja pasar los avisos internos de Next.js (render dinámico)
    console.error('⚠️  No se pudo leer /public/site:', err.message);
    return {
      offline: true,
      settings: { siteName: 'Sabor Marino', slogan: '', colors: DEFAULT_COLORS, contact: {}, logo: null },
      socialLinks: [],
      menus: { header: [], footer: [] },
    };
  }
}
