// CARTA. Dos presentaciones:
//  - "Favoritos" (onlyFeatured): tarjetas grandes con la foto de fondo y el texto encima.
//    En el celular se deslizan de lado (scroll-snap); en computadora se ven las 4 juntas.
//  - Carta completa: filtros por categoría (anclas #ceviches, #bebidas...) y una tarjeta por plato
//    con foto grande, precio y botón "Pedir por WhatsApp" con el mensaje ya escrito.
import { Fish, MessageCircle, Star } from 'lucide-react';
import Section, { Heading } from './Section';
import ResponsiveImage from '../ResponsiveImage';
import { whatsappLink } from '../whatsapp';

const price = (n) => `S/ ${Number(n).toFixed(2)}`;

// Si un plato aún no tiene foto, se muestra un pez sobre el color de marca (nunca un hueco vacío)
const NoPhoto = ({ className = '' }) => (
  <div className={`flex items-center justify-center bg-primary-soft text-primary/40 ${className}`}>
    <Fish className="size-12" aria-hidden />
  </div>
);

function Favorites({ content, categories, isFirst }) {
  const dishes = categories.flatMap((c) => c.dishes).slice(0, 4);
  return (
    <Section tone="soft">
      <Heading isFirst={isFirst} title={content.title} subtitle={content.subtitle} center />
      {/* Celular: carrusel horizontal con "imán" (snap). Desde lg: cuadrícula de 4 */}
      <ul className="reveal -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
        {dishes.map((d) => (
          <li key={d.id} className="group relative w-[72%] shrink-0 snap-start overflow-hidden rounded-3xl bg-primary-muted shadow-lg sm:w-[42%] lg:w-auto">
            {d.image
              ? <ResponsiveImage image={d.image} sizes="(min-width: 1024px) 270px, 72vw" className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105 motion-reduce:transition-none" />
              : <NoPhoto className="aspect-[4/5] w-full" />}
            {/* Degradado oscuro para que el texto blanco se lea sobre cualquier foto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="font-display text-xl leading-snug font-semibold">{d.name}</p>
              {d.description && <p className="mt-1 line-clamp-2 text-sm text-white/80">{d.description}</p>}
              <span className="mt-3 inline-flex rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-primary tabular-nums">{price(d.price)}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-12 text-center">
        <a href="/carta" className="inline-flex h-12 items-center rounded-full border-2 border-primary px-7 font-semibold text-primary transition hover:bg-primary hover:text-on-primary">Ver la carta completa</a>
      </div>
    </Section>
  );
}

function DishCard({ dish, whatsapp, headingTag: H }) {
  const order = whatsapp && whatsappLink(whatsapp, `Hola, quisiera pedir: ${dish.name} (${price(dish.price)})`);
  return (
    <article className="reveal group flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none">
      <div className="relative overflow-hidden">
        {dish.image
          ? <ResponsiveImage image={dish.image} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105 motion-reduce:transition-none" />
          : <NoPhoto className="aspect-[4/3] w-full" />}
        {dish.isFeatured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-on-accent shadow">
            <Star className="size-3.5 fill-current" aria-hidden /> Favorito
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <H className="font-display text-xl leading-snug font-semibold text-ink">{dish.name}</H>
          <span className="shrink-0 rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary tabular-nums">{price(dish.price)}</span>
        </div>
        {dish.description && <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink/65">{dish.description}</p>}
        {order && (
          <a href={order} target="_blank" rel="noreferrer" aria-label={`Pedir ${dish.name} por WhatsApp`}
            className="mt-4 inline-flex items-center gap-2 self-start rounded-full text-sm font-semibold text-primary transition hover:text-accent">
            <MessageCircle className="size-4" aria-hidden /> Pedir por WhatsApp
          </a>
        )}
      </div>
    </article>
  );
}

function FullMenu({ content, categories, isFirst, whatsapp }) {
  // Jerarquía de títulos correcta: si la carta es el primer bloque (h1), las categorías son h2 y los platos h3
  const CatTag = isFirst ? 'h2' : 'h3';
  const DishTag = isFirst ? 'h3' : 'h4';
  return (
    <Section>
      <Heading isFirst={isFirst} title={content.title} subtitle={content.subtitle} />

      {/* Filtros: enlaces a cada categoría. Se quedan pegados bajo la cabecera al bajar */}
      <nav aria-label="Categorías de la carta" className="sticky top-16 z-20 -mx-4 mb-10 border-y border-ink/5 bg-surface/85 px-4 py-3 backdrop-blur-xl sm:top-20 sm:-mx-6 sm:px-6">
        <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {categories.map((c) => (
            <li key={c.id} className="shrink-0">
              <a href={`#${c.slug}`} className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/20 px-4 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-on-primary">
                {c.name} <span className="text-xs opacity-60">{c.dishes.length}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-16">
        {categories.map((c) => (
          <section key={c.id} id={c.slug} className="scroll-mt-40" aria-labelledby={`cat-${c.slug}`}>
            <div className="reveal mb-6">
              <CatTag id={`cat-${c.slug}`} className="font-display text-2xl font-semibold text-primary sm:text-3xl">{c.name}</CatTag>
              {c.description && <p className="mt-1 text-ink/60">{c.description}</p>}
            </div>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {c.dishes.map((d) => <li key={d.id}><DishCard dish={d} whatsapp={whatsapp} headingTag={DishTag} /></li>)}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  );
}

export default function MenuBlock({ content, data, isFirst, site }) {
  if (!data.categories?.length) return null;
  const whatsapp = site?.settings?.contact?.whatsapp;
  return content.onlyFeatured
    ? <Favorites content={content} categories={data.categories} isFirst={isFirst} />
    : <FullMenu content={content} categories={data.categories} isFirst={isFirst} whatsapp={whatsapp} />;
}
