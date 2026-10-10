import { Router } from 'express';
import * as c from '../controllers/pages.controller.js';
import { anyStaff } from '../middlewares/roles.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  pageSchema, pageUpdateSchema, componentCreateSchema, componentUpdateSchema, reorderSchema,
} from '../validators/content.validator.js';

// /api/pages
export const pagesRouter = Router();
pagesRouter.use(anyStaff);
pagesRouter.get('/', c.list);
pagesRouter.post('/', validate(pageSchema), c.create);
pagesRouter.get('/:id', c.get);
pagesRouter.put('/:id', validate(pageUpdateSchema), c.update);
pagesRouter.delete('/:id', c.remove);
pagesRouter.post('/:id/components', validate(componentCreateSchema), c.createComponent);
pagesRouter.put('/:id/components/reorder', validate(reorderSchema), c.reorderComponents);

// /api/components
export const componentsRouter = Router();
componentsRouter.use(anyStaff);
componentsRouter.get('/types', c.blockTypes);
componentsRouter.put('/:id', validate(componentUpdateSchema), c.updateComponent);
componentsRouter.post('/:id/duplicate', c.duplicateComponent);
componentsRouter.delete('/:id', c.removeComponent);
