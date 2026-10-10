// Servicio de autenticación: valida credenciales y genera el token.
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import * as usersService from './users.service.js';

// Hash "señuelo": si el correo no existe igual se ejecuta bcrypt, para que la respuesta
// tarde lo mismo y nadie pueda adivinar qué correos están registrados midiendo el tiempo.
const DUMMY_HASH = bcrypt.hashSync('usuario-inexistente', 10);

export async function login(email, password) {
  const user = usersService.findByEmail(email);

  // Mismo mensaje si el correo no existe o si la clave está mal:
  // así no le decimos a un atacante qué correos están registrados.
  const matches = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  const valid = user && matches;
  if (!valid) throw new AppError(401, 'Correo o contraseña incorrectos');
  if (user.is_active !== 1) throw new AppError(403, 'Tu usuario está desactivado');

  usersService.touchLastLogin(user.id);
  const token = signToken(user);
  return { token, user: usersService.toPublicUser(user) };
}
