// PORTADA. El elemento distintivo del sitio: la foto dentro de un "ojo de buey"
// (la ventana redonda de los barcos), con un anillo del color principal.
// Detalles modernos: manchas de color difuminadas al fondo, entrada animada (fade-up)
// y el anillo punteado girando muy lento (se detiene si el usuario pidió "reducir movimiento").
import { MessageCircle, Sparkles } from 'lucide-react';
import ResponsiveImage from '../ResponsiveImage';
import { whatsappLink } from '../whatsapp';

export default function HeroBlock({ content, data, site }) {
  const external = /^https?:/.test(content.buttonLink);
  const slogan = site?.settings?.slogan;
  const wa = whatsappLink(site?.settings?.contact?.whatsapp);

  return (
    <section className="relative isolate overflow-hidden bg-surface">
      {/* Fondo decorativo: dos manchas grandes y borrosas con los colores de marca */}
      <div aria-hidden className="absolute -top-32 -right-32 -z-10 size-[28rem] rounded-full bg-accent-soft blur-3xl sm:size-[40rem]" />
      <div aria-hidden className="absolute -bottom-40 -left-40 -z-10 size-[24rem] rounded-full bg-primary-soft blur-3xl sm:size-[34rem]" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 md:grid-cols-[1.05fr_1fr] md:gap-6 md:py-24">
        <div className="order-2 md:order-1">
          {slogan && (
            <p className="fade-up mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/15 bg-surface/70 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur">
              <Sparkles className="size-4 shrink-0 text-accent" aria-hidden />
              <span className="truncate">{slogan}</span>
            </p>
          )}
          <h1 className="fade-up delay-1 font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance text-primary sm:text-6xl lg:text-7xl">
            {content.title}
          </h1>
          {content.subtitle && <p className="fade-up delay-2 mt-5 max-w-xl text-lg leading-relaxed text-pretty text-ink/75 sm:text-xl">{content.subtitle}</p>}

          <div className="fade-up delay-3 mt-8 flex flex-wrap gap-3">
            {content.buttonText && content.buttonLink && (
              <a href={content.buttonLink} {...(external && { target: '_blank', rel: 'noreferrer' })}
                className="inline-flex h-12 items-center rounded-full bg-primary px-7 text-base font-semibold text-on-primary shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:bg-primary-dark motion-reduce:transition-none">
                {content.buttonText}
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-primary/20 bg-surface/60 px-6 text-base font-semibold text-primary backdrop-blur transition hover:-translate-y-0.5 hover:border-primary motion-reduce:transition-none">
                <MessageCircle className="size-5" aria-hidden /> Reservar mesa
              </a>
            )}
          </div>
        </div>

        {data.image && (
          <div className="fade-up order-1 flex justify-center md:order-2 md:justify-end">
            <div className="relative aspect-square w-[min(78vw,30rem)] rounded-full border-[10px] border-primary p-2 shadow-2xl shadow-primary/30 sm:border-[14px] sm:p-3">
              <div className="absolute -inset-4 animate-[spin_60s_linear_infinite] rounded-full border-2 border-dashed border-secondary/50 motion-reduce:animate-none sm:-inset-6" aria-hidden />
              <ResponsiveImage image={data.image} priority sizes="(min-width: 768px) 480px, 78vw" className="size-full rounded-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
