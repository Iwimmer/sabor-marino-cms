import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { adminOnly } from '../middlewares/roles.js';
import { validate } from '../middlewares/validate.middleware.js';
import { userCreateSchema, userUpdateSchema } from '../validators/content.validator.js';

const router = Router();

// Todas las rutas de este archivo: sesión iniciada + rol ADMIN
router.use(adminOnly);

router.get('/', usersController.list);
router.get('/roles', usersController.roles);
router.post('/', validate(userCreateSchema), usersController.create);
router.get('/:id', usersController.get);
router.put('/:id', validate(userUpdateSchema), usersController.update);
router.delete('/:id', usersController.remove);

export default router;
