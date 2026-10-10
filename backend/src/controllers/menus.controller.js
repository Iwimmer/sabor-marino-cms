import * as menusService from '../services/menus.service.js';
import { parseId } from '../utils/params.js';

export const list = (_req, res) => res.json({ data: menusService.list() });
export const get = (req, res) => res.json({ data: menusService.getById(parseId(req.params.id)) });
export const createItem = (req, res) => res.status(201).json({ data: menusService.createItem(parseId(req.params.id), req.body) });
export const updateItem = (req, res) => res.json({ data: menusService.updateItem(parseId(req.params.itemId, 'itemId'), req.body) });
export const removeItem = (req, res) => { menusService.removeItem(parseId(req.params.itemId, 'itemId')); res.status(204).end(); };
export const reorder = (req, res) => res.json({ data: menusService.reorderItems(parseId(req.params.id), req.body.items) });
