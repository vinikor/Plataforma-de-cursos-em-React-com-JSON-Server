import { api } from './api';
import type { Plano, CreatePlano, Assinatura, CreateAssinatura, Pagamento, CreatePagamento } from '../models/Planos';

// Planos
export const getPlanos = () =>
  api.get<Plano[]>('/planos');

export const getPlanoById = (id: string) =>
  api.get<Plano>(`/planos/${id}`);

export const createPlano = (plano: CreatePlano) =>
  api.post<Plano>('/planos', plano);

export const updatePlano = (id: string, plano: Partial<CreatePlano>) =>
  api.put<Plano>(`/planos/${id}`, plano);

export const deletePlano = (id: string) =>
  api.delete(`/planos/${id}`);

// Assinaturas
export const getAssinaturas = () =>
  api.get<Assinatura[]>('/assinaturas');

export const getAssinaturaById = (id: string) =>
  api.get<Assinatura>(`/assinaturas/${id}`);

export const getAssinaturasByUsuario = (idUsuario: string) =>
  api.get<Assinatura[]>('/assinaturas', { params: { ID_Usuario: idUsuario } });

export const createAssinatura = (assinatura: CreateAssinatura) =>
  api.post<Assinatura>('/assinaturas', assinatura);

export const updateAssinatura = (id: string, assinatura: Partial<CreateAssinatura>) =>
  api.put<Assinatura>(`/assinaturas/${id}`, assinatura);

export const deleteAssinatura = (id: string) =>
  api.delete(`/assinaturas/${id}`);

// Pagamentos
export const getPagamentos = () =>
  api.get<Pagamento[]>('/pagamentos');

export const getPagamentoById = (id: string) =>
  api.get<Pagamento>(`/pagamentos/${id}`);

export const getPagamentosByAssinatura = (idAssinatura: string) =>
  api.get<Pagamento[]>('/pagamentos', { params: { ID_Assinatura: idAssinatura } });

export const createPagamento = (pagamento: CreatePagamento) =>
  api.post<Pagamento>('/pagamentos', pagamento);

export const updatePagamento = (id: string, pagamento: Partial<CreatePagamento>) =>
  api.put<Pagamento>(`/pagamentos/${id}`, pagamento);

export const deletePagamento = (id: string) =>
  api.delete(`/pagamentos/${id}`);
