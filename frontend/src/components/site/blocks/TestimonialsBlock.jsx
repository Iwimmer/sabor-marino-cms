// TESTIMONIOS: tarjetas con comillas grandes, estrellas y un círculo con la inicial del cliente.
// Las columnas se adaptan a cuántas opiniones hay (1, 2 o 3+), así nunca queda un hueco vacío.
import { Quote, Star } from 'lucide-react';
import Section, { Heading } from './Section';

// Clases escritas completas para que Tailwind las detecte (no se pueden armar con variables)
const COLS = { 1: 'mx-auto max-w-2xl', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' };

export default function TestimonialsBlock({ content, isFirst }) {
  const items = content.items;
  if (!items.length) return null;
  const cols = COLS[Math.min(items.length, 3)];

  return (
    <Section tone="soft">
      <Heading isFirst={isFirst} title={content.title} center={items.length === 1} />
      <ul className={`grid grid-cols-1 gap-6 ${cols}`}>
        {items.map((t, i) => (
          <li key={i} className="reveal">
            <figure className="relative flex h-full flex-col rounded-3xl bg-surface p-7 shadow-sm ring-1 ring-ink/5 transition hover:shadow-lg sm:p-8">
              <Quote className="absolute top-6 right-6 size-10 text-accent/25" aria-hidden />
              <div className="flex gap-0.5 text-accent" role="img" aria-label={`${t.rating} de 5 estrellas`}>
                {Array.from({ length: 5 }).map((_, s) => <Star key={s} className={`size-5 ${s < t.rating ? 'fill-current' : 'opacity-30'}`} aria-hidden />)}
              </div>
              <blockquote className="mt-4 flex-1 font-display text-xl leading-snug text-pretty text-ink">“{t.text}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary font-semibold text-on-primary" aria-hidden>
                  {t.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-primary">{t.name}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
