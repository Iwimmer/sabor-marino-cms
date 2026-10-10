// Crea backend/.env a partir de .env.example con una JWT_SECRET aleatoria.
// Si .env ya existe, no lo toca.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = path.join(root, '.env');

if (fs.existsSync(envFile)) {
  console.log('ℹ️  backend/.env ya existe: se mantiene');
} else {
  const secret = crypto.randomBytes(48).toString('hex');
  const content = fs
    .readFileSync(path.join(root, '.env.example'), 'utf8')
    .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`);
  fs.writeFileSync(envFile, content);
  console.log('✅ backend/.env creado con una clave JWT aleatoria');
}
