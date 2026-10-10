import * as carta from '../services/menuCarta.service.js';
import { parseId } from '../utils/params.js';

const boolQuery = (v) => (v === 'true' ? true : v === 'false' ? false : undefined);

// Categorías
export const listCategories = (_req, res) => res.json({ data: carta.listCategories() });
export const getCategory = (req, res) => res.json({ data: carta.getCategory(parseId(req.params.id)) });
export const createCategory = (req, res) => res.status(201).json({ data: carta.createCategory(req.body) });
export const updateCategory = (req, res) => res.json({ data: carta.updateCategory(parseId(req.params.id), req.body) });
export const removeCategory = (req, res) => { carta.removeCategory(parseId(req.params.id)); res.status(204).end(); };
export const reorderCategories = (req, res) => res.json({ data: carta.reorderCategories(req.body.ids) });
export const reorderDishes = (req, res) => res.json({ data: carta.reorderDishes(parseId(req.params.id), req.body.ids) });

// Platos — GET /api/dishes?categoryId=1&q=ceviche&featured=true&available=true
export const listDishes = (req, res) => {
  const { categoryId, q, featured, available } = req.query;
  res.json({
    data: carta.listDishes({
      categoryId: categoryId ? parseId(categoryId, 'categoryId') : undefined,
      q: q?.toString().trim() || undefined,
      featured: boolQuery(featured),
      available: boolQuery(available),
    }),
  });
};
export const getDish = (req, res) => res.json({ data: carta.getDish(parseId(req.params.id)) });
export const createDish = (req, res) => res.status(201).json({ data: carta.createDish(req.body) });
export const updateDish = (req, res) => res.json({ data: carta.updateDish(parseId(req.params.id), req.body) });
export const removeDish = (req, res) => { carta.removeDish(parseId(req.params.id)); res.status(204).end(); };
