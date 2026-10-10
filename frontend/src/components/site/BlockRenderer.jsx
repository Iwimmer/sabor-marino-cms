// Decide qué componente pinta cada bloque según su "type" (el mismo de page_components).
// Agregar un tipo nuevo = crear su componente y registrarlo aquí.
// "site" (configuración general: WhatsApp, eslogan...) se pasa a todos los bloques
// para que, por ejemplo, la carta pueda armar el enlace "Pedir por WhatsApp".
import HeroBlock from './blocks/HeroBlock';
import MenuBlock from './blocks/MenuBlock';
import GalleryBlock from './blocks/GalleryBlock';
import TestimonialsBlock from './blocks/TestimonialsBlock';
import ScheduleBlock from './blocks/ScheduleBlock';
import ContactBlock from './blocks/ContactBlock';
import TextBlock from './blocks/TextBlock';

const BLOCKS = {
  hero: HeroBlock,
  menu: MenuBlock,
  gallery: GalleryBlock,
  testimonials: TestimonialsBlock,
  schedule: ScheduleBlock,
  contact: ContactBlock,
  text: TextBlock,
};

export default function BlockRenderer({ blocks, site }) {
  return blocks.map((block, index) => {
    const Component = BLOCKS[block.type];
    return Component ? <Component key={block.id} content={block.content} data={block.data} site={site} isFirst={index === 0} /> : null;
  });
}
