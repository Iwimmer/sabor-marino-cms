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
          <ul className="space-y-4">
            {rows.map(([Icon, value, href]) => (
              <li key={value} className="flex items-start gap-3 text-lg">
                <Icon className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
                {href ? <a href={href} className="text-ink hover:text-primary hover:underline">{value}</a> : <span className="text-ink">{value}</span>}
              </li>
            ))}
          </ul>
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-7 font-semibold text-on-accent transition hover:brightness-95">
              <MessageCircle className="size-5" aria-hidden /> Escribir por WhatsApp
            </a>
          )}
        </div>
        {content.showMap && c.mapEmbedUrl && (
          <iframe src={c.mapEmbedUrl} title="Mapa de ubicación" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            className="aspect-[4/3] w-full rounded-2xl border-0 bg-primary-soft shadow-sm" />
        )}
      </div>
    </Section>
  );
}
