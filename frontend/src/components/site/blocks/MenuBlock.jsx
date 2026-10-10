// CARTA. Dos presentaciones:
//  - "Favoritos" (onlyFeatured): platos en ojos de buey pequeños, como la portada.
//  - Carta completa: lista tipo pizarra de cebichería, con puntos guía entre el plato y el precio.
import Section, { Heading } from './Section';
import ResponsiveImage from '../ResponsiveImage';

const price = (n) => `S/ ${Number(n).toFixed(2)}`;

function Favorites({ content, categories, isFirst }) {
  const dishes = categories.flatMap((c) => c.dishes).slice(0, 4);
  return (
    <Section tone="soft">
      <Heading isFirst={isFirst} title={content.title} subtitle={content.subtitle} center />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {dishes.map((d) => (
          <li key={d.id} className="text-center">
            <div className="mx-auto aspect-square w-full max-w-56 rounded-full border-[6px] border-surface shadow-md">
              {d.image ? <ResponsiveImage image={d.image} sizes="(min-width: 1024px) 224px, 45vw" className="size-full rounded-full object-cover" />
                : <div className="size-full rounded-full bg-primary-muted" />}
            </div>
            <p className="mt-4 font-display text-lg leading-snug font-semibold text-ink sm:text-xl">{d.name}</p>
            <p className="mt-1 font-semibold text-primary tabular-nums">{price(d.price)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-12 text-center">
        <a href="/carta" className="inline-flex h-12 items-center rounded-full border-2 border-primary px-7 font-semibold text-primary transition hover:bg-primary hover:text-on-primary">Ver la carta completa</a>
      </div>
    </Section>
  );
}

function FullMenu({ content, categories, isFirst }) {
  return (
    <Section>
      <Heading isFirst={isFirst} title={content.title} subtitle={content.subtitle} />
      <div className="gap-16 lg:columns-2">
        {categories.map((c) => (
          <section key={c.id} className="mb-14 break-inside-avoid">
            <h3 className="border-b-2 border-primary pb-2 font-display text-2xl font-semibold text-primary sm:text-3xl">{c.name}</h3>
            {c.description && <p className="mt-2 text-sm text-ink/60">{c.description}</p>}
            <ul className="mt-5 space-y-5">
              {c.dishes.map((d) => (
                <li key={d.id} className="flex gap-4">
                  {d.image && (
                    <ResponsiveImage image={d.image} sizes="64px" className="size-14 shrink-0 rounded-full object-cover sm:size-16" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-lg font-semibold text-ink">{d.name}</span>
                      {d.isFeatured && <span className="size-2 shrink-0 translate-y-[-2px] rounded-full bg-accent" title="Favorito de la casa" aria-label="Favorito de la casa" />}
                      {/* Puntos guía: se estiran para unir el nombre con el precio */}
                      <span className="min-w-6 flex-1 translate-y-[-4px] border-b-2 border-dotted border-ink/25" aria-hidden />
                      <span className="shrink-0 font-semibold text-primary tabular-nums">{price(d.price)}</span>
                    </div>
                    {d.description && <p className="mt-1 text-[15px] leading-relaxed text-ink/65">{d.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {categories.some((c) => c.dishes.some((d) => d.isFeatured)) && (
        <p className="flex items-center gap-2 text-sm text-ink/60"><span className="size-2 rounded-full bg-accent" /> Favoritos de la casa</p>
      )}
    </Section>
  );
}

export default function MenuBlock({ content, data, isFirst }) {
  if (!data.categories?.length) return null;
  return content.onlyFeatured ? <Favorites content={content} categories={data.categories} isFirst={isFirst} /> : <FullMenu content={content} categories={data.categories} isFirst={isFirst} />;
}
