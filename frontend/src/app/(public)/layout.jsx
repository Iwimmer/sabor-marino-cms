// Layout de la WEB PÚBLICA (Server Component): cabecera y pie con datos de la BD.
import { MessageCircle } from 'lucide-react';
import { getSite } from '@/lib/server-api';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { whatsappLink } from '@/components/site/whatsapp';

export default async function PublicLayout({ children }) {
  const { settings, menus, socialLinks } = await getSite();
  const wa = whatsappLink(settings.contact.whatsapp);

  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary">
        Saltar al contenido
      </a>
      <SiteHeader settings={settings} items={menus.header ?? []} />
      <main id="contenido">{children}</main>
      <SiteFooter settings={settings} items={menus.footer ?? []} socialLinks={socialLinks} />
      {/* Botón flotante de WhatsApp solo en celular; aparece al bajar para no tapar la portada */}
      {wa && (
        <a href={wa} target="_blank" rel="noreferrer" aria-label="Reservar por WhatsApp"
          className="fab-on-scroll fixed right-4 bottom-4 z-30 flex size-14 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg ring-4 ring-surface/60 md:hidden">
          <MessageCircle className="size-6" />
        </a>
      )}
    </>
  );
}
