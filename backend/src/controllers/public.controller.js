import * as publicService from '../services/public.service.js';

export const site = (_req, res) => res.json({ data: publicService.site() });
export const home = (_req, res) => res.json({ data: publicService.home() });
export const page = (req, res) => res.json({ data: publicService.pageBySlug(req.params.slug) });
export const pages = (_req, res) => res.json({ data: publicService.pagesList() });
export const carta = (_req, res) => res.json({ data: publicService.carta() });
