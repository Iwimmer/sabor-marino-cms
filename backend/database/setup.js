// Crea las tablas (schema.sql) y carga los datos demo (seed.js).
// Uso:  npm run db:setup        -> crea lo que falte, sin borrar datos
//       npm run db:reset        -> borra la base de datos y la crea de nuevo
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../src/config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const reset = process.argv.includes('--reset');
let lockedFile = false;

if (reset) {
  try {
    for (const suffix of ['', '-wal', '-shm']) fs.rmSync(env.databasePath + suffix, { force: true });
    console.log('🗑️  Base de datos anterior eliminada');
  } catch (err) {
    // En Windows no se puede borrar un archivo que otro programa tiene abierto
    // (la API encendida, un visor de SQLite...). En ese caso se vacían las tablas por dentro.
    if (!['EPERM', 'EBUSY'].includes(err.code)) throw err;
    lockedFile = true;
  }
  // Imágenes procesadas de la instalación anterior (ya no las usa nadie)
  const uploads = env.uploadsDir;
  if (fs.existsSync(uploads)) {
    for (const f of fs.readdirSync(uploads)) {
      if (f !== '.gitkeep') fs.rmSync(path.join(uploads, f), { force: true, recursive: true });
    }
  }
}

// Se importa DESPUÉS de borrar para que abra un archivo nuevo
const { db, transaction } = await import('../src/lib/db.js');

if (lockedFile) {
  db.exec('PRAGMA foreign_keys = OFF');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all();
  for (const { name } of tables) db.exec(`DROP TABLE IF EXISTS "${name}"`);
  db.exec('PRAGMA foreign_keys = ON');
  console.log('🗑️  Base de datos vaciada (el archivo estaba en uso, se borraron sus tablas)');
}
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
