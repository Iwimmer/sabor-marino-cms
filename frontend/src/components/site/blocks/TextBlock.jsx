// TEXTO CON IMAGEN: párrafos (separados por saltos de línea) y una foto al costado.
// La foto lleva detrás un marco del color de acento, ligeramente girado (detalle decorativo).
import Section from './Section';
import ResponsiveImage from '../ResponsiveImage';

export default function TextBlock({ content, data, isFirst }) {
  const Title = isFirst ? 'h1' : 'h2';
  const left = content.imagePosition === 'left';
  return (
    <Section>
      <div className={`grid items-center gap-10 ${data.image ? 'md:grid-cols-2 md:gap-16' : 'max-w-3xl'}`}>
        <div className={`reveal ${left ? 'md:order-2' : ''}`}>
          {content.title && <Title className="font-display text-3xl leading-tight font-semibold text-balance text-primary sm:text-5xl">{content.title}</Title>}
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink/80">
            {content.body.split(/\n+/).map((par, i) => <p key={i}>{par}</p>)}
          </div>
        </div>
        {data.image && (
          <div className={`reveal relative ${left ? 'md:order-1' : ''}`}>
            <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rotate-2 rounded-[2rem] bg-accent-soft sm:translate-x-5 sm:translate-y-5" />
            <ResponsiveImage image={data.image} sizes="(min-width: 768px) 50vw, 100vw" className="relative aspect-[4/3] w-full rounded-[2rem] object-cover shadow-xl" />
          </div>
        )}
      </div>
    </Section>
  );
}
