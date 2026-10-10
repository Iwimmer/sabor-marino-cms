// Recibe UN archivo (campo "file") en memoria para que sharp lo procese.
// Límite: 8 MB. El tipo real se verifica después con sharp (no confiamos en la extensión).
import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new AppError(400, 'Solo se permiten imágenes'));
    cb(null, true);
  },
});

export const uploadSingleImage = (req, res, next) =>
  upload.single('file')(req, res, (err) => {
    if (err?.code === 'LIMIT_FILE_SIZE') return next(new AppError(413, 'La imagen supera el máximo de 8 MB'));
    if (err instanceof multer.MulterError) return next(new AppError(400, `Error al subir: ${err.message}`));
    next(err);
  });
