import * as settingsService from '../services/settings.service.js';
import { parseId } from '../utils/params.js';

export const get = (_req, res) => res.json({ data: settingsService.get() });
export const update = (req, res) => res.json({ data: settingsService.update(req.body) });

export const listSocial = (_req, res) => res.json({ data: settingsService.listSocial() });
export const createSocial = (req, res) => res.status(201).json({ data: settingsService.createSocial(req.body) });
export const updateSocial = (req, res) => res.json({ data: settingsService.updateSocial(parseId(req.params.id), req.body) });
export const removeSocial = (req, res) => { settingsService.removeSocial(parseId(req.params.id)); res.status(204).end(); };
