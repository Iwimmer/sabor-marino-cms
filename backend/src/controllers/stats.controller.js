import * as statsService from '../services/stats.service.js';

export const summary = (_req, res) => res.json({ data: statsService.summary() });
