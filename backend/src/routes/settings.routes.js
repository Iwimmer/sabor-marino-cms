import { Router } from 'express';
import * as c from '../controllers/settings.controller.js';
import { anyStaff, adminOnly } from '../middlewares/roles.js';
import { validate } from '../middlewares/validate.middleware.js';
import { settingsSchema, socialSchema, socialUpdateSchema } from '../validators/content.validator.js';

export const settingsRouter = Router();
settingsRouter.get('/', anyStaff, c.get);
settingsRouter.put('/', adminOnly, validate(settingsSchema), c.update);

export const socialRouter = Router();
socialRouter.get('/', anyStaff, c.listSocial);
socialRouter.post('/', adminOnly, validate(socialSchema), c.createSocial);
socialRouter.put('/:id', adminOnly, validate(socialUpdateSchema), c.updateSocial);
socialRouter.delete('/:id', adminOnly, c.removeSocial);
