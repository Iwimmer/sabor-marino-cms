// PROXY (antes "middleware") de Next.js: se ejecuta ANTES de mostrar cualquier página /admin.
// Pregunta a la API quién es el usuario (usando su cookie) y decide:
//  - sin sesión           -> redirige a /admin/login
//  - EDITOR en zona ADMIN -> redirige al dashboard
// La API también valida cada petición: esta es una segunda capa para que
// nadie pueda "adivinar" rutas del panel.
import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const ADMIN_ONLY = ['/admin/apariencia', '/admin/usuarios'];

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === '/admin/login';
  const cookie = request.headers.get('cookie') ?? '';

  let user = null;
  if (cookie.includes('sm_token=')) {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, { headers: { cookie }, cache: 'no-store' });
      if (res.ok) user = (await res.json()).data.user;
    } catch {
      // API apagada: se trata como "sin sesión"
    }
  }

  if (isLogin) {
    // Si ya inició sesión, no tiene sentido mostrarle el login
    return user ? NextResponse.redirect(new URL('/admin', request.url)) : NextResponse.next();
  }

  if (!user) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  if (user.role !== 'ADMIN' && ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    const url = new URL('/admin', request.url);
    url.searchParams.set('denied', '1');
    return NextResponse.redirect(url);
  }

  // Pasamos el rol a las páginas por una cabecera (para mostrar/ocultar opciones del menú)
  const headers = new Headers(request.headers);
  headers.set('x-user-role', user.role);
  headers.set('x-user-name', encodeURIComponent(user.name));
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/admin/:path*'],
};
