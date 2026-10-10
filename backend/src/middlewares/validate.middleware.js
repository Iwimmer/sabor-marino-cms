// Valida req.body con un esquema de Zod antes de llegar al controlador.
import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return next(new AppError(400, 'Datos inválidos', details));
  }
  req.body = result.data; // datos ya limpios (trim, lowercase, etc.)
  next();
};
