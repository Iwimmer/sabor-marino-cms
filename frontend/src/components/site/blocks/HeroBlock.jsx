// PORTADA. El elemento distintivo del sitio: la foto dentro de un "ojo de buey"
// (la ventana redonda de los barcos), con un anillo del color principal.
import ResponsiveImage from '../ResponsiveImage';

export default function HeroBlock({ content, data }) {
  const external = /^https?:/.test(content.buttonLink);
  return (
    <section className="overflow-hidden bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 md:grid-cols-[1.05fr_1fr] md:gap-6 md:py-20">
        <div className="order-2 md:order-1">
          <h1 className="font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-primary sm:text-6xl lg:text-7xl">
            {content.title}
          </h1>
          {content.subtitle && <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/75 sm:text-xl">{content.subtitle}</p>}
          {content.buttonText && content.buttonLink && (
            <a href={content.buttonLink} {...(external && { target: '_blank', rel: 'noreferrer' })}
              className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-7 text-base font-semibold text-on-primary transition hover:bg-primary-dark">
              {content.buttonText}
            </a>
          )}
        </div>

        {data.image && (
          <div className="order-1 flex justify-center md:order-2 md:justify-end">
            <div className="relative aspect-square w-[min(78vw,30rem)] rounded-full border-[10px] border-primary p-2 shadow-xl sm:border-[14px] sm:p-3">
              <div className="absolute -inset-4 rounded-full border-2 border-dashed border-secondary/50 sm:-inset-6" aria-hidden />
              <ResponsiveImage image={data.image} priority sizes="(min-width: 768px) 480px, 78vw" className="size-full rounded-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
