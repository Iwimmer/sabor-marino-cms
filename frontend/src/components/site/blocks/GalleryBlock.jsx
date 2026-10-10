// GALERÍA: mosaico donde la primera foto ocupa el doble de espacio.
// Cada foto aparece al hacer scroll (reveal) y hace un zoom suave al pasar el mouse.
import Section, { Heading } from './Section';
import ResponsiveImage from '../ResponsiveImage';

export default function GalleryBlock({ content, data, isFirst }) {
  if (!data.images?.length) return null;
  return (
    <Section>
      {content.title && <Heading isFirst={isFirst} title={content.title} />}
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {data.images.map((img, i) => (
          <li key={img.id} className={`reveal group overflow-hidden rounded-3xl bg-primary-soft shadow-sm ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
            <ResponsiveImage image={img} sizes={i === 0 ? '(min-width: 768px) 66vw, 50vw' : '(min-width: 768px) 33vw, 50vw'}
              className="aspect-square size-full object-cover transition duration-700 group-hover:scale-105 motion-reduce:transition-none" />
          </li>
        ))}
      </ul>
    </Section>
  );
}
