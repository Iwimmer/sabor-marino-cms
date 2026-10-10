// Carta del restaurante: categorías y platos.
// Los precios se guardan en céntimos (INTEGER) y la API los expone en soles (38.5).
import { db } from '../lib/db.js';
import { AppError } from '../utils/AppError.js';
import { buildUpdate } from '../utils/updateBuilder.js';
import { slugify } from '../utils/slugify.js';
import { reorder } from '../utils/reorder.js';
import * as mediaService from './media.service.js';

export const toCents = (soles) => Math.round(soles * 100);
export const toSoles = (cents) => cents / 100;

// ---------- Categorías ----------
const categoryToPublic = (r) => ({
  id: r.id, name: r.name, slug: r.slug, description: r.description,
  sortOrder: r.sort_order, isActive: r.is_active === 1, dishesCount: r.dishes_count ?? 0,
});

const CATEGORY_SQL = `
  SELECT c.*, (SELECT COUNT(*) FROM dishes d WHERE d.category_id = c.id) AS dishes_count FROM categories c
`;

export const listCategories = () => db.prepare(`${CATEGORY_SQL} ORDER BY c.sort_order, c.id`).all().map(categoryToPublic);

export function getCategory(id) {
  const row = db.prepare(`${CATEGORY_SQL} WHERE c.id = ?`).get(id);
  if (!row) throw new AppError(404, 'Categoría no encontrada');
  return categoryToPublic(row);
}

export function createCategory(data) {
  const slug = data.slug ?? slugify(data.name);
  if (db.prepare('SELECT 1 FROM categories WHERE slug = ?').get(slug)) throw new AppError(409, `Ya existe una categoría con el slug "${slug}"`);
  const { next } = db.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM categories').get();
  const id = db.prepare('INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES (?, ?, ?, ?, ?)')
    .run(data.name, slug, data.description ?? null, next, data.isActive === false ? 0 : 1).lastInsertRowid;
  return getCategory(Number(id));
}

export function updateCategory(id, data) {
  getCategory(id);
  if (data.slug && db.prepare('SELECT 1 FROM categories WHERE slug = ? AND id <> ?').get(data.slug, id)) {
    throw new AppError(409, `Ya existe una categoría con el slug "${data.slug}"`);
  }
  const { sql, values, isEmpty } = buildUpdate(data, { name: 'name', slug: 'slug', description: 'description', isActive: 'is_active' });
  if (isEmpty) throw new AppError(400, 'No enviaste ningún campo para actualizar');
  db.prepare(`UPDATE categories SET ${sql} WHERE id = ?`).run(...values, id);
  return getCategory(id);
}

export function removeCategory(id) {
  const cat = getCategory(id);
  if (cat.dishesCount > 0) {
    throw new AppError(409, `No se puede eliminar "${cat.name}" porque tiene ${cat.dishesCount} plato(s). Muévelos o elimínalos primero`);
  }
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
}

export const reorderCategories = (ids) => { reorder('categories', ids); return listCategories(); };

// ---------- Platos ----------
const DISH_SQL = `
  SELECT d.*, c.name AS category_name FROM dishes d JOIN categories c ON c.id = d.category_id
`;

function dishesToPublic(rows) {
  const images = mediaService.resolveMany(rows.map((r) => r.image_id));
  return rows.map((r) => ({
    id: r.id,
    categoryId: r.category_id,
    categoryName: r.category_name,
    name: r.name,
    description: r.description,
    price: toSoles(r.price_cents),
    priceCents: r.price_cents,
    imageId: r.image_id,
    image: images.get(r.image_id) ?? null,
    isAvailable: r.is_available === 1,
    isFeatured: r.is_featured === 1,
    sortOrder: r.sort_order,
    updatedAt: r.updated_at,
  }));
}

export function listDishes({ categoryId, q, featured, available } = {}) {
  const where = [];
  const params = [];
  if (categoryId) { where.push('d.category_id = ?'); params.push(categoryId); }
  if (q) { where.push('(d.name LIKE ? OR d.description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
  if (featured !== undefined) { where.push('d.is_featured = ?'); params.push(featured ? 1 : 0); }
  if (available !== undefined) { where.push('d.is_available = ?'); params.push(available ? 1 : 0); }
  const sql = `${DISH_SQL} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY c.sort_order, d.sort_order, d.id`;
  return dishesToPublic(db.prepare(sql).all(...params));
}

export function getDish(id) {
  const row = db.prepare(`${DISH_SQL} WHERE d.id = ?`).get(id);
  if (!row) throw new AppError(404, 'Plato no encontrado');
  return dishesToPublic([row])[0];
}

export function createDish(data) {
  getCategory(data.categoryId);
  if (data.imageId) mediaService.getById(data.imageId);
  const { next } = db.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM dishes WHERE category_id = ?').get(data.categoryId);
  const id = db.prepare(`
    INSERT INTO dishes (category_id, name, description, price_cents, image_id, is_available, is_featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.categoryId, data.name, data.description ?? null, toCents(data.price), data.imageId ?? null,
    data.isAvailable === false ? 0 : 1, data.isFeatured ? 1 : 0, next).lastInsertRowid;
  return getDish(Number(id));
}

export function updateDish(id, data) {
  getDish(id);
  if (data.categoryId) getCategory(data.categoryId);
  if (data.imageId) mediaService.getById(data.imageId);
  const payload = { ...data };
  if (payload.price !== undefined) payload.priceCents = toCents(payload.price);
  const { sql, values, isEmpty } = buildUpdate(payload, {
    categoryId: 'category_id', name: 'name', description: 'description', priceCents: 'price_cents',
    imageId: 'image_id', isAvailable: 'is_available', isFeatured: 'is_featured',
  });
  if (isEmpty) throw new AppError(400, 'No enviaste ningún campo para actualizar');
  db.prepare(`UPDATE dishes SET ${sql}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
  return getDish(id);
}

export function removeDish(id) {
  const r = db.prepare('DELETE FROM dishes WHERE id = ?').run(id);
  if (r.changes === 0) throw new AppError(404, 'Plato no encontrado');
}

export function reorderDishes(categoryId, ids) {
  getCategory(categoryId);
  reorder('dishes', ids, { where: 'category_id = ?', params: [categoryId] });
  return listDishes({ categoryId });
}

/** Carta pública: categorías activas con sus platos disponibles. */
export function publicMenu({ categoryIds = [], onlyFeatured = false } = {}) {
  let categories = listCategories().filter((c) => c.isActive);
  if (categoryIds.length) categories = categories.filter((c) => categoryIds.includes(c.id));
  const dishes = listDishes({ available: true, ...(onlyFeatured && { featured: true }) });
  return categories
    .map(({ dishesCount, isActive, sortOrder, ...c }) => ({
      ...c,
      dishes: dishes.filter((d) => d.categoryId === c.id),
    }))
    .filter((c) => c.dishes.length > 0);
}
