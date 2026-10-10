// Carga las imágenes de demostración pasando por el MISMO proceso que una foto subida
// desde el panel (sharp -> 3 tamaños WebP) y las asigna al logo, la portada, la galería y los platos.
//
// ¿Quieres fotos reales? Pon en la carpeta seed-images/photos/ archivos con estos nombres
// (jpg, jpeg, png o webp): hero, local, ceviche-clasico, arroz-con-mariscos, picarones, etc.
// Si existe la foto se usa; si no, se usa la ilustración.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ILLUSTRATIONS } from './illustrations.js';
import { slugify } from '../../src/utils/slugify.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS = path.join(__dirname, 'photos');

function findPhoto(key) {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    const file = path.join(PHOTOS, `${key}.${ext}`);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

export async function seedImages(db) {
  const mediaService = await import('../../src/services/media.service.js');
  const ids = {};
  let photos = 0;

  for (const [key, { svg, alt }] of Object.entries(ILLUSTRATIONS)) {
    const photo = findPhoto(key);
    // Por seguridad la API no acepta SVG (puede contener scripts): la ilustración se convierte antes a PNG
    const buffer = photo ? fs.readFileSync(photo) : await sharp(Buffer.from(svg())).png().toBuffer();
    if (photo) photos++;
    const media = await mediaService.create(
      { buffer, originalname: photo ? path.basename(photo) : `${key}.png`, size: buffer.length },
      { alt, userId: 1 }
    );
    ids[key] = media.id;
  }

  // Logo y portada
  db.prepare('UPDATE site_settings SET logo_id = ? WHERE id = 1').run(ids.logo);
  const setContent = db.prepare("UPDATE page_components SET content = json_set(content, ?, json(?)) WHERE id = ?");
  for (const c of db.prepare('SELECT id, type, page_id FROM page_components').all()) {
    if (c.type === 'hero') setContent.run('$.imageId', String(ids.hero), c.id);
    if (c.type === 'text') setContent.run('$.imageId', String(ids.local), c.id);
    if (c.type === 'gallery') {
      const gallery = ['local', 'ceviche-mixto', 'arroz-con-mariscos', 'causa-de-langostinos', 'tiradito-al-aji-amarillo', 'picarones'];
      setContent.run('$.imageIds', JSON.stringify(gallery.map((k) => ids[k])), c.id);
    }
  }

  // Cada plato recibe la imagen cuyo nombre coincide con el suyo
  const setDish = db.prepare('UPDATE dishes SET image_id = ? WHERE id = ?');
  let dishes = 0;
  for (const d of db.prepare('SELECT id, name FROM dishes').all()) {
    const key = slugify(d.name.replace(/\(.*\)/, ''));
    const match = ids[key] ?? ids[slugify(d.name)];
    if (match) { setDish.run(match, d.id); dishes++; }
  }

  return { total: Object.keys(ids).length, photos, dishes };
}
