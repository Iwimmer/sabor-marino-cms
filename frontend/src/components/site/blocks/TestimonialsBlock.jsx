// TESTIMONIOS: citas en columnas, sin tarjetas, con estrellas del color de acento.
import { Star } from 'lucide-react';
import Section, { Heading } from './Section';

export default function TestimonialsBlock({ content, isFirst }) {
  if (!content.items.length) return null;
  return (
    <Section tone="soft">
      <Heading isFirst={isFirst} title={content.title} />
      <ul className="grid gap-10 md:grid-cols-3 md:gap-12">
        {content.items.map((t, i) => (
          <li key={i}>
            <figure>
              <div className="flex gap-0.5 text-accent" aria-label={`${t.rating} de 5 estrellas`}>
                {Array.from({ length: 5 }).map((_, s) => <Star key={s} className={`size-5 ${s < t.rating ? 'fill-current' : 'opacity-30'}`} aria-hidden />)}
              </div>
              <blockquote className="mt-4 font-display text-xl leading-snug text-ink sm:text-2xl">“{t.text}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-primary">{t.name}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
