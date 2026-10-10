// Cabecera pública (Server Component). El menú viene de la base de datos:
// si el admin reordena los enlaces en el panel, aquí cambian solos.
import Link from 'next/link';
import MobileNav from './MobileNav';
import { whatsappLink } from './whatsapp';

export default function SiteHeader({ settings, items }) {
  const reserve = whatsappLink(settings.contact.whatsapp);
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {settings.logo && <img src={settings.logo.variants[0].url} alt="" className="size-9 shrink-0 rounded-full sm:size-11" />}
          <span className="truncate font-display text-xl font-semibold text-primary sm:text-2xl">{settings.siteName}</span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <NavLink item={item} className="rounded-lg px-3 py-2 text-[15px] font-medium text-ink/80 transition-colors hover:text-primary" />
              {item.children.length > 0 && (
                <div className="invisible absolute top-full left-0 min-w-48 rounded-xl border border-ink/10 bg-surface p-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  {item.children.map((c) => <NavLink key={c.id} item={c} className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-primary-soft hover:text-primary" />)}
                </div>
              )}
            </div>
          ))}
          {reserve && (
            <a href={reserve} target="_blank" rel="noreferrer" className="ml-3 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition hover:brightness-95">
              Reservar
            </a>
          )}
        </nav>

        <MobileNav items={items} reserve={reserve} />
      </div>
    </header>
  );
}

export function NavLink({ item, className }) {
  return item.isExternal
    ? <a href={item.href} target="_blank" rel="noreferrer" className={className}>{item.label}</a>
    : <Link href={item.href} className={className}>{item.label}</Link>;
}
