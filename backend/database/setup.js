// Crea las tablas (schema.sql) y carga los datos demo (seed.js).
// Uso:  npm run db:setup        -> crea lo que falte, sin borrar datos
//       npm run db:reset        -> borra la base de datos y la crea de nuevo
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../src/config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.argv.includes('--reset')) {
  for (const suffix of ['', '-wal', '-shm']) {
    fs.rmSync(env.databasePath + suffix, { force: true });
  }
  console.log('🗑️  Base de datos anterior eliminada');
}

// Se importa DESPUÉS de borrar para que abra un archivo nuevo
const { db, transaction } = await import('../src/lib/db.js');
const { seed } = await import('./seed.js');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);
console.log('✅ Tablas creadas/verificadas');

const { total } = db.prepare('SELECT COUNT(*) AS total FROM roles').get();
if (total === 0) {
  transaction(() => seed(db));
  console.log('🌱 Datos de demostración cargados');
  const { seedImages } = await import('./seed-images/seedImages.js');
  const img = await seedImages(db);
  const ilus = img.total - img.photos;
  console.log(`🖼️  ${img.total} imágenes procesadas con sharp (${img.photos} fotos reales, ${ilus} ${ilus === 1 ? 'ilustración' : 'ilustraciones'}); ${img.dishes} platos con foto`);
  console.log('   Admin:  admin@sabormarino.pe  / Admin123*');
  console.log('   Editor: editor@sabormarino.pe / Editor123*');
} else {
  console.log('ℹ️  La base de datos ya tenía datos: no se cargó el seed');
}

db.close();
