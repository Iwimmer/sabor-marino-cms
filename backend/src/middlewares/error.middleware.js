// Manejo central de errores: todas las respuestas de error tienen el mismo formato.
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export const notFound = (req, _res, next) =>
  next(new AppError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') err = new AppError(400, 'El cuerpo de la petición no es JSON válido');

  // Errores de restricciones de SQLite -> respuestas HTTP entendibles
  if (err.code === 'ERR_SQLITE_ERROR') {
    if (/UNIQUE constraint failed/.test(err.message)) err = new AppError(409, 'Ya existe un registro con ese valor', [{ field: err.message.split(': ')[1] }]);
    else if (/FOREIGN KEY constraint failed/.test(err.message)) err = new AppError(409, 'El registro está relacionado con otros datos o la referencia no existe');
    else if (/CHECK constraint failed/.test(err.message)) err = new AppError(400, 'Los datos no cumplen las reglas de la base de datos', [{ rule: err.message.split(': ')[1] }]);
  }

  const status = err instanceof AppError ? err.status : 500;
  if (status === 500) console.error('💥', err);

  res.status(status).json({
    error: {
      message: status === 500 ? 'Error interno del servidor' : err.message,
      ...(err.details && { details: err.details }),
      ...(status === 500 && !env.isProd && { debug: err.message }),
    },
  });
}
