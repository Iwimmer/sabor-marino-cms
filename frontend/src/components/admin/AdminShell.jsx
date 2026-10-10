'use client';
// Estructura del panel:
//  - Escritorio (lg ≥ 1024px): barra lateral fija a la izquierda.
//  - Tablet y celular: barra superior con botón ☰ que abre la barra lateral como cajón (drawer).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, Menu as MenuIcon, UtensilsCrossed, Image as ImageIcon,
  Palette, Users, LogOut, ExternalLink, X, Fish,
} from 'lucide-react';
import { api } from '@/lib/api';

const NAV = [
  { href: '/admin', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/admin/paginas', label: 'Páginas', icon: FileText },
  { href: '/admin/menus', label: 'Menú de navegación', icon: MenuIcon },
  { href: '/admin/carta', label: 'Carta', icon: UtensilsCrossed },
  { href: '/admin/medios', label: 'Imágenes', icon: ImageIcon },
  { href: '/admin/apariencia', label: 'Apariencia', icon: Palette, adminOnly: true },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users, adminOnly: true },
];

export default function AdminShell({ user, siteName, children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setOpen(false), [pathname]); // cerrar el cajón al navegar

  const logout = async () => {
    await api.post('/auth/logout');
    router.replace('/admin/login');
    router.refresh();
  };

  const isActive = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));
  const items = NAV.filter((i) => !i.adminOnly || user.role === 'ADMIN');

  const sidebar = (
    <nav className="flex h-full flex-col" aria-label="Navegación del panel">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-on-primary"><Fish className="size-4" /></span>
        <span className="truncate font-semibold text-slate-900">{siteName}</span>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} aria-current={isActive(item) ? 'page' : undefined}
              className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                isActive(item) ? 'bg-primary-soft text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
              <item.icon className="size-[18px] shrink-0" aria-hidden />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="space-y-1 border-t border-slate-200 p-3">
        <a href="/" target="_blank" rel="noreferrer"
          className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100">
          <ExternalLink className="size-[18px]" aria-hidden /> Ver sitio web
        </a>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-slate-900">{user.name}</span>
            <span className="block text-xs text-slate-500">{user.role === 'ADMIN' ? 'Administrador' : 'Editor'}</span>
          </span>
          <button onClick={logout} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600" aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogOut className="size-[18px]" />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Barra lateral fija (escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>

      {/* Cajón (celular/tablet) */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar menú">
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Barra superior (celular/tablet) */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="-ml-2 rounded-lg p-2.5 text-slate-600 hover:bg-slate-100" aria-label="Abrir menú" aria-expanded={open}>
            <MenuIcon className="size-5" />
          </button>
          <span className="truncate font-semibold text-slate-900">{siteName}</span>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
