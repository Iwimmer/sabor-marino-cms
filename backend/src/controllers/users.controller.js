import * as usersService from '../services/users.service.js';
import { parseId } from '../utils/params.js';

export const list = (_req, res) => res.json({ data: usersService.listUsers() });
export const roles = (_req, res) => res.json({ data: usersService.listRoles() });
export const get = (req, res) => res.json({ data: usersService.getUser(parseId(req.params.id)) });
export const create = async (req, res) => res.status(201).json({ data: await usersService.createUser(req.body) });
export const update = async (req, res) =>
  res.json({ data: await usersService.updateUser(parseId(req.params.id), req.body, req.user.id) });
export const remove = (req, res) => { usersService.removeUser(parseId(req.params.id), req.user.id); res.status(204).end(); };
