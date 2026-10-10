'use client';
// Menú del celular: botón ☰ que despliega los enlaces debajo de la cabecera.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import SocialIcons from './SocialIcons';

export default function MobileNav({ items, reserve, socialLinks = [] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  const link = (item, sub = false) => {
    const cls = `block rounded-lg px-3 py-3 text-base font-medium ${sub ? 'pl-8 text-ink/70' : 'text-ink'} hover:bg-primary-soft`;
    return item.isExternal
      ? <a key={item.id} href={item.href} target="_blank" rel="noreferrer" className={cls}>{item.label}</a>
      : <Link key={item.id} href={item.href} className={cls} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>;
  };

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="menu-movil" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        className="-mr-2 flex size-11 items-center justify-center rounded-lg text-ink">
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>
      {open && (
        <nav id="menu-movil" aria-label="Principal" className="fade-up absolute inset-x-0 top-full border-b border-ink/10 bg-surface px-4 pt-2 pb-5 shadow-lg">
          {items.map((i) => [link(i), ...i.children.map((c) => link(c, true))])}
          {reserve && <a href={reserve} target="_blank" rel="noreferrer" className="mt-3 block rounded-full bg-accent px-5 py-3 text-center font-semibold text-on-accent">Reservar por WhatsApp</a>}
          <SocialIcons links={socialLinks} className="mt-4 justify-center gap-2" itemClassName="size-11 bg-primary-soft text-primary" />
        </nav>
      )}
    </div>
  );
}
