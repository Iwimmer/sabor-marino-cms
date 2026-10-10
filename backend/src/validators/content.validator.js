// Esquemas Zod para páginas, bloques, menús, configuración, carta y usuarios.
import { z } from 'zod';
import { BLOCK_TYPES } from './blocks.validator.js';

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Usa un color HEX de 6 dígitos, ej. #0F4C75');
const id = z.number().int().positive();
const bool = z.boolean();
// Solo http(s): evita valores peligrosos como javascript:alert(1)
const url = z.url({ protocol: /^https?$/, message: 'Debe ser una URL válida que empiece con https://' }).max(500);
const RESERVED = ['admin', 'api', 'uploads', '_next'];
const slug = z.string().trim().min(1).max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones (ej. nuestra-historia)')
  .refine((s) => !RESERVED.includes(s), 'Esa dirección está reservada por el sistema');

// ---------- Configuración ----------
export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(80),
  slogan: z.string().trim().max(160).nullable(),
  logoId: id.nullable(),
  primaryColor: hex, secondaryColor: hex, accentColor: hex, backgroundColor: hex, textColor: hex,
  phone: z.string().trim().max(30).nullable(),
  whatsapp: z.string().trim().regex(/^\d{8,15}$/, 'Solo números con código de país, ej. 51999888777').nullable(),
  email: z.string().trim().pipe(z.email('Correo inválido')).nullable(),
  address: z.string().trim().max(200).nullable(),
  mapEmbedUrl: url.nullable(),
  footerText: z.string().trim().max(200).nullable(),
}).partial();

export const socialSchema = z.object({
  platform: z.enum(['facebook', 'instagram', 'tiktok', 'youtube', 'x', 'whatsapp', 'otro']),
  url,
  isVisible: bool.optional(),
});
export const socialUpdateSchema = socialSchema.partial();

// ---------- Páginas y bloques ----------
export const pageSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(120),
  slug: slug.optional(),
  metaDescription: z.string().trim().max(300).nullable().optional(),
  isPublished: bool.optional(),
  isHome: bool.optional(),
});
export const pageUpdateSchema = pageSchema.partial();

export const componentCreateSchema = z.object({
  type: z.enum(BLOCK_TYPES, { message: `Tipo inválido. Usa: ${BLOCK_TYPES.join(', ')}` }),
  content: z.record(z.string(), z.unknown()).optional(),
  isVisible: bool.optional(),
});
export const componentUpdateSchema = z.object({
  content: z.record(z.string(), z.unknown()).optional(),
  isVisible: bool.optional(),
});

export const reorderSchema = z.object({
  ids: z.array(id).min(1, 'Envía al menos un id'),
});

// ---------- Menús ----------
const menuItemBase = z.object({
  label: z.string().trim().min(1, 'El texto del enlace es obligatorio').max(60),
  pageId: id.nullable().optional(),
  url: z.string().trim().max(300).refine((v) => v.startsWith('/') || /^https?:\/\//.test(v), 'Usa una ruta (/promo) o URL completa (https://...)').nullable().optional(),
  parentId: id.nullable().optional(),
  isVisible: bool.optional(),
});
export const menuItemSchema = menuItemBase.refine((d) => d.pageId || d.url, {
  message: 'Indica una página (pageId) o una URL', path: ['pageId'],
});
export const menuItemUpdateSchema = menuItemBase.partial();
export const menuReorderSchema = z.object({
  items: z.array(z.object({ id, parentId: id.nullable().optional() })).min(1),
});

// ---------- Carta ----------
export const categorySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(60),
  slug: slug.optional(),
  description: z.string().trim().max(200).nullable().optional(),
  isActive: bool.optional(),
});
export const categoryUpdateSchema = categorySchema.partial();

export const dishSchema = z.object({
  categoryId: id,
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(80),
  description: z.string().trim().max(300).nullable().optional(),
  price: z.number({ message: 'El precio debe ser un número' }).min(0, 'El precio no puede ser negativo').max(9999),
  imageId: id.nullable().optional(),
  isAvailable: bool.optional(),
  isFeatured: bool.optional(),
});
export const dishUpdateSchema = dishSchema.partial();

// ---------- Usuarios ----------
const password = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .max(72)
  .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
  .regex(/[0-9]/, 'Debe tener al menos un número');

export const userCreateSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(80),
  email: z.string().trim().toLowerCase().pipe(z.email('Correo inválido')),
  password,
  role: z.enum(['ADMIN', 'EDITOR']),
  isActive: bool.optional(),
});
export const userUpdateSchema = userCreateSchema.partial();

export const mediaAltSchema = z.object({ alt: z.string().trim().max(200) });
