// Carga y valida las variables de entorno UNA sola vez.
// Si falta algo importante, el servidor no arranca y dice qué falta.
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..'); // carpeta backend/

dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });

const required = ['JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Falta la variable de entorno ${key}. Copia .env.example a .env`);
    process.exit(1);
  }
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  databasePath: path.resolve(ROOT, process.env.DATABASE_PATH || './database/cms.db'),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  uploadsDir: path.resolve(ROOT, process.env.UPLOADS_DIR || './uploads'),
  rootDir: ROOT,
};
