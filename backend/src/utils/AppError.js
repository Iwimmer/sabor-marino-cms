// Error "controlado": lleva el código HTTP que debe responder la API.
// Ej: throw new AppError(404, 'Página no encontrada')
export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
