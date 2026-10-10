import { Router } from 'express';
import * as c from '../controllers/carta.controller.js';
import { anyStaff } from '../middlewares/roles.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  categorySchema, categoryUpdateSchema, dishSchema, dishUpdateSchema, reorderSchema,
} from '../validators/content.validator.js';

// /api/categories
export const categoriesRouter = Router();
categoriesRouter.use(anyStaff);
categoriesRouter.get('/', c.listCategories);
categoriesRouter.post('/', validate(categorySchema), c.createCategory);
categoriesRouter.put('/reorder', validate(reorderSchema), c.reorderCategories);
categoriesRouter.get('/:id', c.getCategory);
categoriesRouter.put('/:id', validate(categoryUpdateSchema), c.updateCategory);
categoriesRouter.delete('/:id', c.removeCategory);
categoriesRouter.put('/:id/dishes/reorder', validate(reorderSchema), c.reorderDishes);

// /api/dishes
export const dishesRouter = Router();
dishesRouter.use(anyStaff);
dishesRouter.get('/', c.listDishes);
dishesRouter.post('/', validate(dishSchema), c.createDish);
dishesRouter.get('/:id', c.getDish);
dishesRouter.put('/:id', validate(dishUpdateSchema), c.updateDish);
dishesRouter.delete('/:id', c.removeDish);
