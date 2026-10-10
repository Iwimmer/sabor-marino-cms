// Datos para la WEB PÚBLICA: todo lo que el visitante necesita, ya "resuelto"
// (imágenes con sus URLs, platos de la carta, menús con sus enlaces).
import { db } from '../lib/db.js';
import { AppError } from '../utils/AppError.js';
import * as settingsService from './settings.service.js';
import * as menusService from './menus.service.js';
import * as pagesService from './pages.service.js';
import * as mediaService from './media.service.js';
import * as cartaService from './menuCarta.service.js';

/** Datos del layout: identidad visual, contacto, redes y menús. */
export function site() {
  return {
    settings: settingsService.get(),
    socialLinks: settingsService.listSocial({ onlyVisible: true }),
    menus: menusService.publicByLocation(),
  };
}

/**
 * Agrega a cada bloque un campo "data" con lo que necesita para pintarse.
 * Ej.: un bloque "gallery" solo guarda imageIds: [3, 5]; aquí se convierten en URLs.
 */
function resolveBlocks(components) {
  const imageIds = components.flatMap((c) => [c.content.imageId, ...(c.content.imageIds ?? []), ...(c.content.slideIds ?? [])]);
  const images = mediaService.resolveMany(imageIds);

  return components.map((c) => {
    const data = {};
    if ('imageId' in c.content) data.image = images.get(c.content.imageId) ?? null;
    // Portada: la imagen principal + las del carrusel, en orden y sin las que se hayan borrado
    if (c.type === 'hero') data.slides = [c.content.imageId, ...(c.content.slideIds ?? [])].map((id) => images.get(id)).filter(Boolean);
    if (c.type === 'gallery') data.images = c.content.imageIds.map((id) => images.get(id)).filter(Boolean);
    if (c.type === 'menu') data.categories = cartaService.publicMenu(c.content);
    if (c.type === 'contact') data.contact = settingsService.get().contact;
    return { id: c.id, type: c.type, content: c.content, data };
  });
}

function pageBy(where, param) {
  const row = db.prepare(`SELECT * FROM pages WHERE ${where} AND is_published = 1`).get(param);
  if (!row) throw new AppError(404, 'Página no encontrada');
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    isHome: row.is_home === 1,
    metaDescription: row.meta_description,
    updatedAt: row.updated_at,
    blocks: resolveBlocks(pagesService.componentsOf(row.id, { onlyVisible: true })),
  };
}

export const home = () => pageBy('is_home = ?', 1);
export const pageBySlug = (slug) => pageBy('slug = ?', slug);

export const pagesList = () =>
  db.prepare('SELECT title, slug, is_home, updated_at FROM pages WHERE is_published = 1 ORDER BY id').all()
    .map((r) => ({ title: r.title, slug: r.slug, path: r.is_home === 1 ? '/' : `/${r.slug}`, updatedAt: r.updated_at }));

export const carta = () => cartaService.publicMenu();
