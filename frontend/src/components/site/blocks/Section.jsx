// Contenedor común de las secciones: mismo ancho máximo y espaciado vertical en todo el sitio.
export default function Section({ children, className = '', tone = 'plain', id }) {
  const bg = { plain: 'bg-surface', soft: 'bg-primary-soft', deep: 'bg-primary text-on-primary' }[tone];
  return (
    <section id={id} className={`${bg} ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">{children}</div>
    </section>
  );
}

// El primer bloque de una página usa <h1> (título principal); los demás, <h2>.
// La barrita de color de acento sobre el título da un toque moderno y une todas las secciones.
export const Heading = ({ title, subtitle, center = false, isFirst = false }) => {
  const Tag = isFirst ? 'h1' : 'h2';
  return (
    <div className={`reveal mb-10 max-w-2xl sm:mb-14 ${center ? 'mx-auto text-center' : ''}`}>
      <span aria-hidden className={`mb-4 block h-1 w-12 rounded-full bg-accent ${center ? 'mx-auto' : ''}`} />
      <Tag className="font-display text-3xl leading-tight font-semibold text-balance text-primary sm:text-5xl">{title}</Tag>
      {subtitle && <p className="mt-3 text-lg text-pretty text-ink/70">{subtitle}</p>}
    </div>
  );
};
