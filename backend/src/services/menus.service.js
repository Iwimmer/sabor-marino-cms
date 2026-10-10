// Menús de navegación (cabecera y pie) y sus ítems, con soporte para submenús de un nivel.
import { db, transaction } from '../lib/db.js';
import { AppError } from '../utils/AppError.js';
import { buildUpdate } from '../utils/updateBuilder.js';

const ITEMS_SQL = `
  SELECT mi.*, p.slug AS page_slug, p.title AS page_title, p.is_home AS page_is_home, p.is_published AS page_published
  FROM menu_items mi
  LEFT JOIN pages p ON p.id = mi.page_id
`;

// A dónde lleva el enlace: la página interna (/carta) o la URL externa
const hrefOf = (r) => (r.page_id ? (r.page_is_home === 1 ? '/' : `/${r.page_slug}`) : r.url);

const itemToPublic = (r) => ({
  id: r.id,
  menuId: r.menu_id,
  parentId: r.parent_id,
  label: r.label,
  pageId: r.page_id,
  pageTitle: r.page_title ?? null,
  url: r.url,
  href: hrefOf(r),
  isExternal: !r.page_id && /^https?:\/\//.test(r.url ?? ''), // /promo es interno; https://... es externo
  sortOrder: r.sort_order,
  isVisible: r.is_visible === 1,
});

// Convierte la lista plana en árbol: ítems con sus "children"
function toTree(items) {
  const roots = items.filter((i) => !i.parentId).map((i) => ({ ...i, children: [] }));
  for (const child of items.filter((i) => i.parentId)) {
    roots.find((r) => r.id === child.parentId)?.children.push(child);
  }
  return roots;
}

function itemsOf(menuId, { onlyVisible = false } = {}) {
  const extra = onlyVisible ? 'AND mi.is_visible = 1 AND (mi.page_id IS NULL OR p.is_published = 1)' : '';
  return db.prepare(`${ITEMS_SQL} WHERE mi.menu_id = ? ${extra} ORDER BY mi.sort_order, mi.id`).all(menuId).map(itemToPublic);
}

export function list({ onlyVisible = false } = {}) {
  return db.prepare('SELECT * FROM menus ORDER BY id').all().map((m) => ({
    id: m.id, name: m.name, location: m.location, items: toTree(itemsOf(m.id, { onlyVisible })),
  }));
}

export function getById(id) {
  const m = db.prepare('SELECT * FROM menus WHERE id = ?').get(id);
  if (!m) throw new AppError(404, 'Menú no encontrado');
  return { id: m.id, name: m.name, location: m.location, items: toTree(itemsOf(m.id)) };
}

/** Menús públicos indexados por ubicación: { header: [...], footer: [...] } */
export function publicByLocation() {
  return Object.fromEntries(list({ onlyVisible: true }).map((m) => [m.location, m.items]));
}

function getItem(id) {
  const r = db.prepare(`${ITEMS_SQL} WHERE mi.id = ?`).get(id);
  if (!r) throw new AppError(404, 'Ítem de menú no encontrado');
  return itemToPublic(r);
}

function checkParent(menuId, parentId, selfId) {
  if (!parentId) return;
  if (parentId === selfId) throw new AppError(400, 'Un ítem no puede ser su propio padre');
  if (selfId && db.prepare('SELECT 1 FROM menu_items WHERE parent_id = ?').get(selfId)) {
    throw new AppError(400, 'Este enlace tiene sub-enlaces: no puede convertirse en submenú (solo se permite un nivel)');
  }
  const parent = db.prepare('SELECT menu_id, parent_id FROM menu_items WHERE id = ?').get(parentId);
  if (!parent || parent.menu_id !== menuId) throw new AppError(400, 'El ítem padre no pertenece a este menú');
  if (parent.parent_id) throw new AppError(400, 'Solo se permite un nivel de submenú');
}

function checkPage(pageId) {
  if (pageId && !db.prepare('SELECT 1 FROM pages WHERE id = ?').get(pageId)) {
    throw new AppError(400, 'La página indicada no existe');
  }
}

export function createItem(menuId, data) {
  getById(menuId);
  checkParent(menuId, data.parentId);
  checkPage(data.pageId);
  const { next } = db.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM menu_items WHERE menu_id = ?').get(menuId);
  const id = db.prepare(`
    INSERT INTO menu_items (menu_id, parent_id, label, page_id, url, sort_order, is_visible)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(menuId, data.parentId ?? null, data.label, data.pageId ?? null, data.url ?? null, next, data.isVisible === false ? 0 : 1).lastInsertRowid;
  return getItem(Number(id));
}

export function updateItem(id, data) {
  const current = getItem(id);
  if (data.parentId !== undefined) checkParent(current.menuId, data.parentId, id);
  if (data.pageId) checkPage(data.pageId);
  // Si cambia a página interna, se limpia la URL (y viceversa)
  if (data.pageId) data.url = null;
  if (data.url) data.pageId = null;
  const { sql, values, isEmpty } = buildUpdate(data, {
    label: 'label', pageId: 'page_id', url: 'url', parentId: 'parent_id', isVisible: 'is_visible',
  });
  if (isEmpty) throw new AppError(400, 'No enviaste ningún campo para actualizar');
  db.prepare(`UPDATE menu_items SET ${sql} WHERE id = ?`).run(...values, id);
  return getItem(id);
}

export function removeItem(id) {
  const r = db.prepare('DELETE FROM menu_items WHERE id = ?').run(id); // sus submenús se borran en cascada
  if (r.changes === 0) throw new AppError(404, 'Ítem de menú no encontrado');
}

/**
 * Guarda el nuevo orden que viene del "arrastrar y soltar" del panel.
 * items: [{ id, parentId }] en el orden final.
 */
export function reorderItems(menuId, items) {
  getById(menuId);
  const existing = db.prepare('SELECT id FROM menu_items WHERE menu_id = ?').all(menuId).map((r) => r.id);
  const ids = items.map((i) => i.id);
  const sameSet = new Set(ids).size === ids.length && ids.length === existing.length && ids.every((id) => existing.includes(id));
  if (!sameSet) throw new AppError(400, 'Debes enviar todos los ítems del menú, sin repetir', { expected: existing });

  const parentOf = new Map(items.map((i) => [i.id, i.parentId ?? null]));
  for (const { id, parentId } of items) {
    if (!parentId) continue;
    if (parentId === id || !parentOf.has(parentId)) throw new AppError(400, `Padre inválido para el ítem ${id}`);
    if (parentOf.get(parentId)) throw new AppError(400, 'Solo se permite un nivel de submenú');
    if (items.some((other) => other.parentId === id)) throw new AppError(400, 'Un enlace con sub-enlaces no puede ser submenú (solo un nivel)');
  }

  transaction(() => {
    const stmt = db.prepare('UPDATE menu_items SET sort_order = ?, parent_id = ? WHERE id = ?');
    items.forEach((i, index) => stmt.run(index + 1, i.parentId ?? null, i.id));
  });
  return getById(menuId);
}
