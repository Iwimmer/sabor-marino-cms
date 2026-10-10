import * as pagesService from '../services/pages.service.js';
import { parseId } from '../utils/params.js';

// Páginas
export const list = (_req, res) => res.json({ data: pagesService.list() });
export const get = (req, res) => res.json({ data: pagesService.getById(parseId(req.params.id)) });
export const create = (req, res) => res.status(201).json({ data: pagesService.create(req.body, req.user.id) });
export const update = (req, res) => res.json({ data: pagesService.update(parseId(req.params.id), req.body) });
export const remove = (req, res) => { pagesService.remove(parseId(req.params.id)); res.status(204).end(); };

// Bloques
export const blockTypes = (_req, res) => res.json({ data: pagesService.blockCatalog() });
export const createComponent = (req, res) =>
  res.status(201).json({ data: pagesService.createComponent(parseId(req.params.id), req.body) });
export const reorderComponents = (req, res) =>
  res.json({ data: pagesService.reorderComponents(parseId(req.params.id), req.body.ids) });
export const updateComponent = (req, res) => res.json({ data: pagesService.updateComponent(parseId(req.params.id), req.body) });
export const duplicateComponent = (req, res) => res.status(201).json({ data: pagesService.duplicateComponent(parseId(req.params.id)) });
export const removeComponent = (req, res) => { pagesService.removeComponent(parseId(req.params.id)); res.status(204).end(); };
