// Pie de página público: contacto, menú del pie y redes (todo desde la BD).
import Link from 'next/link';
import { NavLink } from './SiteHeader';
import SocialIcons from './SocialIcons';

export default function SiteFooter({ settings, items, socialLinks }) {
  const { contact } = settings;
  return (
    <footer className="bg-primary text-on-primary">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-3xl font-semibold">{settings.siteName}</p>
          {settings.slogan && <p className="mt-2 max-w-sm opacity-80">{settings.slogan}</p>}
          {contact.address && <p className="mt-6 text-sm opacity-80">{contact.address}</p>}
          <p className="mt-1 text-sm opacity-80">{[contact.phone, contact.email].filter(Boolean).join(' / ')}</p>
        </div>
        {items.length > 0 && (
          <nav aria-label="Pie de página">
            <p className="mb-3 font-display text-lg">Explora</p>
            <ul className="space-y-2">{items.map((i) => <li key={i.id}><NavLink item={i} className="opacity-80 hover:opacity-100 hover:underline" /></li>)}</ul>
          </nav>
        )}
        {socialLinks.length > 0 && (
          <div>
            <p className="mb-3 font-display text-lg">Síguenos</p>
            <SocialIcons links={socialLinks} className="gap-2" itemClassName="size-11 bg-on-primary/10 hover:bg-on-primary/20" />
          </div>
        )}
      </div>
      <div className="border-t border-on-primary/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm opacity-70 sm:flex-row sm:justify-between sm:px-6">
          <p>{settings.footerText}</p>
          <Link href="/admin" className="hover:underline">Administrar sitio</Link>
        </div>
      </div>
    </footer>
  );
}
