import { Router } from 'express';
import * as c from '../controllers/media.controller.js';
import { anyStaff } from '../middlewares/roles.js';
import { uploadSingleImage } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { mediaAltSchema } from '../validators/content.validator.js';

const router = Router();
router.use(anyStaff);

router.get('/', c.list);
router.post('/', uploadSingleImage, c.upload);
router.get('/:id', c.get);
router.put('/:id', validate(mediaAltSchema), c.updateAlt);
router.delete('/:id', c.remove);

export default router;
