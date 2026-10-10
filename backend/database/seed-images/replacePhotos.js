// Reemplaza las ilustraciones de demostración por las fotos reales de seed-images/photos/
// SIN borrar la base de datos ni apagar el sistema.
// Uso:  npm run db:photos   (o doble clic en actualizar-fotos.bat)
//
// Para cada foto (ej. photos/ceviche-clasico.jpg):
//  1. La procesa con sharp igual que una subida desde el panel (3 tamaños WebP).
//  2. Busca la ilustración con el mismo nombre (ceviche-clasico.png) y cambia todas sus
//     referencias (logo, platos y bloques) por la foto nueva.
//  3. Elimina la ilustración y sus archivos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ILLUSTRATIONS } from './illustrations.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHOTOS = path.join(__dirname, 'photos');

const { db, transaction } = await import('../../src/lib/db.js');
const mediaService = await import('../../src/services/media.service.js');

const files = fs.existsSync(PHOTOS) ? fs.readdirSync(PHOTOS) : [];
let replaced = 0;

for (const file of files) {
  const { name, ext } = path.parse(file);
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext.toLowerCase()) || !ILLUSTRATIONS[name]) continue;

  const old = db.prepare('SELECT id FROM media WHERE original_name = ?').get(`${name}.png`);
  if (!old) {
    console.log(`·  ${name}: ya usa una foto (se omite)`);
    continue;
  }

  const buffer = fs.readFileSync(path.join(PHOTOS, file));
  const media = await mediaService.create(
    { buffer, originalname: file, size: buffer.length },
    { alt: ILLUSTRATIONS[name].alt, userId: 1 }
  );

  transaction(() => {
    db.prepare('UPDATE site_settings SET logo_id = ? WHERE logo_id = ?').run(media.id, old.id);
    db.prepare('UPDATE dishes SET image_id = ? WHERE image_id = ?').run(media.id, old.id);
    // Bloques: imageId y listas imageIds dentro del JSON
    for (const c of db.prepare('SELECT id, content FROM page_components').all()) {
      const content = JSON.parse(c.content);
      let changed = false;
      if (content.imageId === old.id) { content.imageId = media.id; changed = true; }
      if (Array.isArray(content.imageIds) && content.imageIds.includes(old.id)) {
        content.imageIds = content.imageIds.map((x) => (x === old.id ? media.id : x));
        changed = true;
      }
      if (changed) db.prepare('UPDATE page_components SET content = ? WHERE id = ?').run(JSON.stringify(content), c.id);
    }
  });
  await mediaService.remove(old.id);

  console.log(`✅ ${name}: foto ${Math.round(buffer.length / 1024)} KB -> ${media.variants.map((v) => `${v.width}px ${Math.round(v.bytes / 1024)} KB`).join(' · ')}`);
  replaced++;
}

console.log(replaced ? `\n🖼️  ${replaced} foto(s) reemplazada(s). Recarga la web para verlas.` : '\nNo había fotos nuevas para reemplazar.');
db.close();
