// Página de login (Server Component): lee el nombre y el logo del sitio
// y entrega el formulario interactivo (Client Component).
import { getSite } from '@/lib/server-api';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = { title: 'Iniciar sesión' };

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const { settings } = await getSite();
  // Solo se permite volver a rutas internas del panel (evita redirecciones a otros sitios)
  const safeNext = typeof next === 'string' && next.startsWith('/admin') ? next : '/admin';

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      {/* Panel de marca: solo en pantallas grandes */}
      <section className="relative hidden overflow-hidden bg-primary p-12 text-on-primary lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-secondary/40 blur-2xl" aria-hidden />
        <div className="absolute -top-16 -left-16 size-72 rounded-full bg-accent/30 blur-2xl" aria-hidden />
        <p className="relative font-display text-2xl font-semibold">{settings.siteName}</p>
        <div className="relative max-w-md">
          <h1 className="font-display text-4xl leading-tight font-semibold">Administra tu restaurante sin escribir código</h1>
          <p className="mt-4 text-lg opacity-85">Cambia la carta, los colores, el menú y cada sección de tu web desde un solo lugar.</p>
        </div>
        <p className="relative text-sm opacity-70">Panel de administración · CMS {settings.siteName}</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <p className="font-display text-2xl font-semibold text-primary">{settings.siteName}</p>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-slate-500">Ingresa con tu correo y contraseña.</p>
          <LoginForm next={safeNext} showDemoUsers={process.env.SHOW_DEMO_USERS === 'true'} />
        </div>
      </section>
    </main>
  );
}
