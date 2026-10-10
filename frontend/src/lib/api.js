// Cliente de la API para el NAVEGADOR (Client Components del panel).
// Usa rutas relativas (/api/...): Next.js las reenvía a Express y la cookie
// httpOnly viaja sola porque es el mismo origen.

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details ?? [];
  }
  /** Convierte details [{field, message}] en { campo: 'mensaje' } para los formularios */
  fieldErrors() {
    return Object.fromEntries(this.details.filter((d) => d.field).map((d) => [d.field, d.message]));
  }
}

async function request(method, path, body) {
  const isForm = body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/')) {
    // La sesión expiró: volver al login y regresar luego a esta pantalla
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new ApiError(401, 'Tu sesión expiró');
  }
  if (res.status === 204) return null;

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json.error?.message ?? 'Ocurrió un error inesperado', json.error?.details);
  return json.data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
};

/** Precio en soles con formato peruano: 38.5 -> "S/ 38.50" */
export const formatPrice = (n) => `S/ ${Number(n).toFixed(2)}`;
