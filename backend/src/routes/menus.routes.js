import { Router } from 'express';
import * as c from '../controllers/menus.controller.js';
import { anyStaff } from '../middlewares/roles.js';
import { validate } from '../middlewares/validate.middleware.js';
import { menuItemSchema, menuItemUpdateSchema, menuReorderSchema } from '../validators/content.validator.js';

const router = Router();
router.use(anyStaff);

router.get('/', c.list);
router.put('/items/:itemId', validate(menuItemUpdateSchema), c.updateItem);
router.delete('/items/:itemId', c.removeItem);
router.get('/:id', c.get);
router.post('/:id/items', validate(menuItemSchema), c.createItem);
router.put('/:id/items/reorder', validate(menuReorderSchema), c.reorder);

export default router;
