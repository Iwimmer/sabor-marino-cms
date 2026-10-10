// CONTACTO: datos del restaurante (editados en "Apariencia"), botón de WhatsApp y mapa.
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import Section, { Heading } from './Section';
import { whatsappLink } from '../whatsapp';

export default function ContactBlock({ content, data, isFirst }) {
  const c = data.contact ?? {};
  const wa = content.showWhatsapp && whatsappLink(c.whatsapp);
  const rows = [
    [MapPin, c.address, null],
    [Phone, c.phone, c.phone && `tel:${c.phone.replace(/[^\d+]/g, '')}`],
    [Mail, c.email, c.email && `mailto:${c.email}`],
  ].filter(([, v]) => v);

  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <div>
          <Heading isFirst={isFirst} title={content.title} subtitle={content.subtitle} />
          <ul className="reveal space-y-4">
            {rows.map(([Icon, value, href]) => (
              <li key={value} className="flex items-center gap-4 text-lg">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><Icon className="size-5" aria-hidden /></span>
                {href ? <a href={href} className="text-ink hover:text-primary hover:underline">{value}</a> : <span className="text-ink">{value}</span>}
              </li>
            ))}
          </ul>
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-7 font-semibold text-on-accent shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 hover:brightness-95 motion-reduce:transition-none">
              <MessageCircle className="size-5" aria-hidden /> Escribir por WhatsApp
            </a>
          )}
        </div>
        {content.showMap && c.mapEmbedUrl && (
          <iframe src={c.mapEmbedUrl} title="Mapa de ubicación" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            className="reveal aspect-[4/3] w-full rounded-3xl border-0 bg-primary-soft shadow-lg" />
        )}
      </div>
    </Section>
  );
}
