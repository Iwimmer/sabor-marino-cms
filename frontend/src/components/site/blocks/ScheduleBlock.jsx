// HORARIO: misma tipografía de "pizarra" que la carta, para que el sitio se sienta coherente.
import Section, { Heading } from './Section';

export default function ScheduleBlock({ content, isFirst }) {
  return (
    <Section>
      <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:gap-16">
        <Heading isFirst={isFirst} title={content.title} subtitle={content.note} />
        <dl className="reveal space-y-5 rounded-3xl bg-primary-soft p-6 sm:p-8">
          {content.items.map((it, i) => (
            <div key={i} className="sm:flex sm:items-baseline sm:gap-3">
              <dt className="font-display text-xl font-semibold text-ink">{it.days}</dt>
              <span className="hidden min-w-6 flex-1 border-b-2 border-dotted border-ink/25 sm:block" aria-hidden />
              <dd className="mt-1 font-semibold text-primary tabular-nums sm:mt-0 sm:shrink-0">{it.hours}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
