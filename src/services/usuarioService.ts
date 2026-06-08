import { api } from './api';
import type { Usuario } from '../models/Usuario';

export const getUsuarios = () =>
  api.get<Usuario[]>('/usuarios');

export const getUsuarioById = (id: string) =>
  api.get<Usuario>(`/usuarios/${id}`);

export const getUsuarioByEmail = (email: string) =>
  api.get<Usuario[]>(`/usuarios?Email=${email}`);

export const createUsuario = (usuario: Usuario) =>
  api.post<Usuario>('/usuarios', usuario);

export const updateUsuario = (id: string, usuario: Partial<Usuario>) =>
  api.put<Usuario>(`/usuarios/${id}`, usuario);

export const deleteUsuario = (id: string) =>
  api.delete(`/usuarios/${id}`);