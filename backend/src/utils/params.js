// Lee un id numérico de la URL (/api/pages/:id). Si no es válido responde 400.
import { AppError } from './AppError.js';

export function parseId(value, name = 'id') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, `El parámetro "${name}" debe ser un número entero positivo`);
  return id;
}

// SQLite guarda booleanos como 0/1
export const toBool = (v) => v === 1;
export const toInt = (b) => (b ? 1 : 0);
