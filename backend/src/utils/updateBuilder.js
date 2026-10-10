// Construye un UPDATE solo con los campos que llegaron en la petición.
// Ej: buildUpdate({ title: 'Hola', isPublished: false }, { title: 'title', isPublished: 'is_published' })
//  -> { sql: 'title = ?, is_published = ?', values: ['Hola', 0] }
export function buildUpdate(data, columnMap) {
  const sets = [];
  const values = [];
  for (const [key, column] of Object.entries(columnMap)) {
    if (data[key] === undefined) continue;
    let value = data[key];
    if (typeof value === 'boolean') value = value ? 1 : 0;
    sets.push(`${column} = ?`);
    values.push(value);
  }
  return { sql: sets.join(', '), values, isEmpty: sets.length === 0 };
}
