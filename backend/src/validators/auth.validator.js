import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Ingresa un correo válido')),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});
