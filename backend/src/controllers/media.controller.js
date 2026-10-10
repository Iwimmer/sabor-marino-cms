import * as mediaService from '../services/media.service.js';
import { parseId } from '../utils/params.js';

export const list = (_req, res) => res.json({ data: mediaService.list() });
export const get = (req, res) => res.json({ data: mediaService.getById(parseId(req.params.id)) });

// POST /api/media  (multipart/form-data: file + alt)
export async function upload(req, res) {
  const media = await mediaService.create(req.file, { alt: req.body?.alt?.trim() || null, userId: req.user.id });
  res.status(201).json({ data: media });
}

export const updateAlt = (req, res) => res.json({ data: mediaService.updateAlt(parseId(req.params.id), req.body.alt) });
export async function remove(req, res) {
  await mediaService.remove(parseId(req.params.id));
  res.status(204).end();
}
