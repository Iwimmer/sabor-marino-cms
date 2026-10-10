// Reordena filas según el orden de una lista de ids: [7, 3, 5] => 7 queda 1.º, 3 queda 2.º...
// Verifica que los ids pertenezcan al grupo (ej.: los bloques de UNA página).
import { db, transaction } from '../lib/db.js';
import { AppError } from './AppError.js';

export function reorder(table, ids, { where = '1 = 1', params = [] } = {}) {
  const existing = db.prepare(`SELECT id FROM ${table} WHERE ${where}`).all(...params).map((r) => r.id);
  const sameSet =
    new Set(ids).size === ids.length && ids.length === existing.length && ids.every((id) => existing.includes(id));
  if (!sameSet) {
    throw new AppError(400, 'La lista de ids debe contener exactamente todos los elementos a ordenar, sin repetir', {
      expected: existing.sort((a, b) => a - b),
    });
  }
  transaction(() => {
    const stmt = db.prepare(`UPDATE ${table} SET sort_order = ? WHERE id = ?`);
    ids.forEach((id, index) => stmt.run(index + 1, id));
  });
}
