// Páginas y sus bloques (page_components). El contenido de cada bloque se valida
// con el esquema de su tipo antes de guardarse como JSON.
import { db, transaction } from '../lib/db.js';
import { AppError } from '../utils/AppError.js';
import { buildUpdate } from '../utils/updateBuilder.js';
import { slugify } from '../utils/slugify.js';
import { reorder } from '../utils/reorder.js';
import { BLOCK_SCHEMAS, BLOCK_CATALOG } from '../validators/blocks.validator.js';

const pageToPublic = (r) => ({
  id: r.id,
  title: r.title,
  slug: r.slug,
  path: r.is_home === 1 ? '/' : `/${r.slug}`,
  metaDescription: r.meta_description,
  isHome: r.is_home === 1,
  isPublished: r.is_published === 1,
  authorName: r.author_name ?? null,
  componentsCount: r.components_count ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const componentToPublic = (r) => ({
  id: r.id,
  pageId: r.page_id,
  type: r.type,
  sortOrder: r.sort_order,
  isVisible: r.is_visible === 1,
  content: JSON.parse(r.content),
  updatedAt: r.updated_at,
});

const PAGE_SQL = `
  SELECT p.*, u.name AS author_name,
         (SELECT COUNT(*) FROM page_components c WHERE c.page_id = p.id) AS components_count
  FROM pages p LEFT JOIN users u ON u.id = p.author_id
`;

// ---------- Páginas ----------
export const list = () => db.prepare(`${PAGE_SQL} ORDER BY p.is_home DESC, p.id`).all().map(pageToPublic);

export function getRow(id) {
  const row = db.prepare(`${PAGE_SQL} WHERE p.id = ?`).get(id);
  if (!row) throw new AppError(404, 'Página no encontrada');
  return row;
}

export const componentsOf = (pageId, { onlyVisible = false } = {}) =>
  db.prepare(`SELECT * FROM page_components WHERE page_id = ? ${onlyVisible ? 'AND is_visible = 1' : ''} ORDER BY sort_order, id`)
    .all(pageId).map(componentToPublic);

export const getById = (id) => ({ ...pageToPublic(getRow(id)), components: componentsOf(id) });

function uniqueSlug(base, ignoreId = 0) {
  let candidate = base || 'pagina';
  let n = 2;
  while (db.prepare('SELECT 1 FROM pages WHERE slug = ? AND id <> ?').get(candidate, ignoreId)) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}

export function create(data, authorId) {
  // "admin", "api"… están reservados para el sistema: se les agrega un sufijo
  const base = slugify(data.title);
  const slug = data.slug ?? uniqueSlug(['admin', 'api', 'uploads'].includes(base) ? `${base}-pagina` : base);
  if (db.prepare('SELECT 1 FROM pages WHERE slug = ?').get(slug)) throw new AppError(409, `Ya existe una página con el slug "${slug}"`);
  if (data.isHome && data.isPublished === false) throw new AppError(400, 'La página de inicio no puede estar despublicada');
  const id = transaction(() => {
    if (data.isHome) db.exec('UPDATE pages SET is_home = 0');
    return Number(db.prepare(`
      INSERT INTO pages (title, slug, meta_description, is_home, is_published, author_id) VALUES (?, ?, ?, ?, ?, ?)
    `).run(data.title, slug, data.metaDescription ?? null, data.isHome ? 1 : 0, data.isPublished === false ? 0 : 1, authorId).lastInsertRowid);
  });
  return getById(id);
}

export function update(id, data) {
  const current = getRow(id);
  if (data.isHome === false && current.is_home === 1) {
    throw new AppError(400, 'Debe existir una página de inicio. Marca otra página como inicio en lugar de desmarcar esta');
  }
  // Se valida el estado FINAL: la página de inicio siempre debe quedar publicada
  const willBeHome = data.isHome ?? current.is_home === 1;
  const willBePublished = data.isPublished ?? current.is_published === 1;
  if (willBeHome && !willBePublished) {
    throw new AppError(400, 'La página de inicio no puede estar despublicada. Publícala primero');
  }
  if (data.slug && db.prepare('SELECT 1 FROM pages WHERE slug = ? AND id <> ?').get(data.slug, id)) {
    throw new AppError(409, `Ya existe una página con el slug "${data.slug}"`);
  }
  const { sql, values, isEmpty } = buildUpdate(data, {
    title: 'title', slug: 'slug', metaDescription: 'meta_description', isPublished: 'is_published', isHome: 'is_home',
  });
  if (isEmpty) throw new AppError(400, 'No enviaste ningún campo para actualizar');
  transaction(() => {
    if (data.isHome) db.exec('UPDATE pages SET is_home = 0'); // solo una página puede ser inicio
    db.prepare(`UPDATE pages SET ${sql}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
  });
  return getById(id);
}

export function remove(id) {
  const row = getRow(id);
  if (row.is_home === 1) throw new AppError(400, 'No se puede eliminar la página de inicio');
  db.prepare('DELETE FROM pages WHERE id = ?').run(id); // sus bloques se borran en cascada
}

// ---------- Bloques ----------
export const blockCatalog = () => BLOCK_CATALOG;

/** Valida el contenido con el esquema del tipo y devuelve el objeto limpio. */
function validateContent(type, content) {
  const result = BLOCK_SCHEMAS[type].safeParse(content);
  if (!result.success) {
    throw new AppError(400, `El contenido no es válido para un bloque "${type}"`,
      result.error.issues.map((i) => ({ field: `content.${i.path.join('.')}`, message: i.message })));
  }
  return result.data;
}

function getComponentRow(id) {
  const row = db.prepare('SELECT * FROM page_components WHERE id = ?').get(id);
  if (!row) throw new AppError(404, 'Bloque no encontrado');
  return row;
}

const touchPage = (pageId) => db.prepare("UPDATE pages SET updated_at = datetime('now') WHERE id = ?").run(pageId);

export function createComponent(pageId, { type, content, isVisible }) {
  getRow(pageId);
  const defaults = BLOCK_CATALOG.find((b) => b.type === type).defaults;
  const clean = validateContent(type, content ?? defaults);
  const { next } = db.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM page_components WHERE page_id = ?').get(pageId);
  const id = db.prepare('INSERT INTO page_components (page_id, type, sort_order, is_visible, content) VALUES (?, ?, ?, ?, ?)')
    .run(pageId, type, next, isVisible === false ? 0 : 1, JSON.stringify(clean)).lastInsertRowid;
  touchPage(pageId);
  return componentToPublic(getComponentRow(Number(id)));
}

export function updateComponent(id, { content, isVisible }) {
  const row = getComponentRow(id);
  if (content === undefined && isVisible === undefined) throw new AppError(400, 'No enviaste ningún campo para actualizar');
  const json = content !== undefined ? JSON.stringify(validateContent(row.type, content)) : row.content;
  const visible = isVisible === undefined ? row.is_visible : isVisible ? 1 : 0;
  db.prepare("UPDATE page_components SET content = ?, is_visible = ?, updated_at = datetime('now') WHERE id = ?").run(json, visible, id);
  touchPage(row.page_id);
  return componentToPublic(getComponentRow(id));
}

export function duplicateComponent(id) {
  const row = getComponentRow(id);
  return transaction(() => {
    db.prepare('UPDATE page_components SET sort_order = sort_order + 1 WHERE page_id = ? AND sort_order > ?').run(row.page_id, row.sort_order);
    const newId = db.prepare('INSERT INTO page_components (page_id, type, sort_order, is_visible, content) VALUES (?, ?, ?, ?, ?)')
      .run(row.page_id, row.type, row.sort_order + 1, row.is_visible, row.content).lastInsertRowid;
    touchPage(row.page_id);
    return componentToPublic(getComponentRow(Number(newId)));
  });
}

export function removeComponent(id) {
  const row = getComponentRow(id);
  db.prepare('DELETE FROM page_components WHERE id = ?').run(id);
  touchPage(row.page_id);
}

export function reorderComponents(pageId, ids) {
  getRow(pageId);
  reorder('page_components', ids, { where: 'page_id = ?', params: [pageId] });
  touchPage(pageId);
  return componentsOf(pageId);
}
