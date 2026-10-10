// GALERÍA: mosaico donde la primera foto ocupa el doble de espacio.
import Section, { Heading } from './Section';
import ResponsiveImage from '../ResponsiveImage';

export default function GalleryBlock({ content, data, isFirst }) {
  if (!data.images?.length) return null;
  return (
    <Section>
      {content.title && <Heading isFirst={isFirst} title={content.title} />}
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {data.images.map((img, i) => (
          <li key={img.id} className={`overflow-hidden rounded-2xl bg-primary-soft ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
            <ResponsiveImage image={img} sizes={i === 0 ? '(min-width: 768px) 66vw, 50vw' : '(min-width: 768px) 33vw, 50vw'}
              className="aspect-square size-full object-cover transition duration-500 hover:scale-[1.03] motion-reduce:transition-none" />
          </li>
        ))}
      </ul>
    </Section>
  );
}
