// Esquema de cada TIPO de bloque. La tabla page_components guarda el contenido como JSON,
// y aquí se define qué forma debe tener ese JSON según el tipo.
import { z } from 'zod';

const text = (max) => z.string().trim().max(max);
const optionalText = (max) => text(max).optional().default('');
const mediaId = z.number().int().positive().nullable().default(null);
const link = z.string().trim().max(300).refine((v) => v === '' || v.startsWith('/') || /^https?:\/\//.test(v), {
  message: 'Debe ser una ruta interna (/carta) o una URL que empiece con http(s)://',
});

export const BLOCK_SCHEMAS = {
  hero: z.object({
    title: text(120).min(1, 'El título es obligatorio'),
    subtitle: optionalText(300),
    imageId: mediaId,
    buttonText: optionalText(40),
    buttonLink: link.optional().default(''),
  }),
  menu: z.object({
    title: text(120).min(1, 'El título es obligatorio'),
    subtitle: optionalText(300),
    categoryIds: z.array(z.number().int().positive()).max(50).default([]), // vacío = todas
    onlyFeatured: z.boolean().default(false),
  }),
  gallery: z.object({
    title: optionalText(120),
    imageIds: z.array(z.number().int().positive()).max(24, 'Máximo 24 imágenes').default([]),
  }),
  testimonials: z.object({
    title: text(120).min(1, 'El título es obligatorio'),
    items: z.array(z.object({
      name: text(60).min(1, 'El nombre es obligatorio'),
      text: text(400).min(1, 'El testimonio es obligatorio'),
      rating: z.number().int().min(1, 'Mínimo 1 estrella').max(5, 'Máximo 5 estrellas').default(5),
    })).max(12, 'Máximo 12 testimonios').default([]),
  }),
  schedule: z.object({
    title: text(120).min(1, 'El título es obligatorio'),
    items: z.array(z.object({
      days: text(60).min(1, 'Indica los días'),
      hours: text(60).min(1, 'Indica el horario'),
    })).max(10).default([]),
    note: optionalText(300),
  }),
  contact: z.object({
    title: text(120).min(1, 'El título es obligatorio'),
    subtitle: optionalText(300),
    showMap: z.boolean().default(true),
    showWhatsapp: z.boolean().default(true),
  }),
  text: z.object({
    title: optionalText(120),
    body: text(5000).min(1, 'El texto es obligatorio'),
    imageId: mediaId,
    imagePosition: z.enum(['left', 'right']).default('right'),
  }),
};

export const BLOCK_TYPES = Object.keys(BLOCK_SCHEMAS);

// Catálogo para el panel: nombre amigable, descripción y contenido inicial de cada bloque
export const BLOCK_CATALOG = [
  { type: 'hero', label: 'Portada (Hero)', description: 'Imagen grande con título, subtítulo y botón',
    defaults: { title: 'Título principal', subtitle: '', imageId: null, buttonText: 'Ver más', buttonLink: '/carta' } },
  { type: 'menu', label: 'Carta', description: 'Platos de la carta, por categorías o solo destacados',
    defaults: { title: 'Nuestra carta', subtitle: '', categoryIds: [], onlyFeatured: false } },
  { type: 'gallery', label: 'Galería', description: 'Cuadrícula de fotos',
    defaults: { title: 'Galería', imageIds: [] } },
  { type: 'testimonials', label: 'Testimonios', description: 'Opiniones de clientes con estrellas',
    defaults: { title: 'Lo que dicen nuestros clientes', items: [] } },
  { type: 'schedule', label: 'Horario', description: 'Días y horas de atención',
    defaults: { title: 'Horario de atención', items: [{ days: 'Lunes a domingo', hours: '11:00 a. m. – 5:00 p. m.' }], note: '' } },
  { type: 'contact', label: 'Contacto', description: 'Datos de contacto, mapa y botón de WhatsApp',
    defaults: { title: 'Contáctanos', subtitle: '', showMap: true, showWhatsapp: true } },
  { type: 'text', label: 'Texto con imagen', description: 'Párrafo con una imagen opcional al costado',
    defaults: { title: 'Título', body: 'Escribe aquí tu texto.', imageId: null, imagePosition: 'right' } },
];
