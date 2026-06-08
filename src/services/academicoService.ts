import { api } from './api';
import type { Categorias, Cursos, Modulos, Aulas, Trilhas, TrilhasCursos } from '../models/Academico';

export const getCategorias = () =>
  api.get<Categorias[]>('/categorias');

export const getCategoriaById = (id: string) =>
  api.get<Categorias>(`/categorias/${id}`);

export const createCategoria = (categoria: Omit<Categorias, 'id'>) =>
  api.post<Categorias>('/categorias', categoria);

export const deleteCategoria = (id: string) =>
  api.delete(`/categorias/${id}`);

export const deleteCurso = (id: string) =>
  api.delete(`/cursos/${id}`);

export const createCurso = (curso: Omit<Cursos, 'id'>) =>
  api.post<Cursos>('/cursos', curso);

export const getModulosByCurso = (idCurso: string) =>
  api.get<Modulos[]>('/modulos', { params: { idCurso } });

export const createModulo = (modulo: Omit<Modulos, 'id'>) =>
  api.post<Modulos>('/modulos', modulo);

export const deleteModulo = (id: string) =>
  api.delete(`/modulos/${id}`);

export const getAulasByModulo = (idModulo: string) =>
  api.get<Aulas[]>('/aulas', { params: { idModulo } });

export const createAula = (aula: Omit<Aulas, 'id'>) =>
  api.post<Aulas>('/aulas', aula);

export const deleteAula = (id: string) =>
  api.delete(`/aulas/${id}`);

export const deleteModuloCascade = async (id: string) => {
  // Busca todas as aulas do módulo e exclui antes de remover o módulo
  try {
    const aulasResponse = await getAulasByModulo(id);
    const aulas = aulasResponse.data || [];
    await Promise.all(aulas.map((a) => api.delete(`/aulas/${a.id}`)));
  } catch (err) {
    // se falhar ao buscar/excluir aulas, logue e continue com a exclusão do módulo
    console.error('Erro ao excluir aulas do módulo (cascade):', err);
  }
  return deleteModulo(id);
};

export const deleteCursoCascade = async (id: string) => {
  // Busca todos os módulos do curso e exclui aulas e módulos antes de remover o curso
  try {
    const modulosResponse = await getModulosByCurso(id);
    const modulos = modulosResponse.data || [];
    await Promise.all(modulos.map(async (m) => {
      try {
        const aulasResponse = await getAulasByModulo(m.id);
        const aulas = aulasResponse.data || [];
        await Promise.all(aulas.map((a) => api.delete(`/aulas/${a.id}`)));
      } catch (err) {
        console.error('Erro ao excluir aulas do módulo durante cascade do curso:', err);
      }
      try {
        await api.delete(`/modulos/${m.id}`);
      } catch (err) {
        console.error('Erro ao excluir módulo durante cascade do curso:', err);
      }
    }));
  } catch (err) {
    console.error('Erro ao buscar/excluir módulos do curso (cascade):', err);
  }

  return deleteCurso(id);
};

export const deleteCategoriaCascade = async (id: string) => {
  try {
    // Busca cursos vinculados à categoria
    const cursosResponse = await api.get<Cursos[]>('/cursos', { params: { idCategoria: id } });
    const cursos = cursosResponse.data || [];
    // Para cada curso, faça cascade (módulos + aulas) e exclua o curso
    await Promise.all(cursos.map(async (c) => {
      try {
        await deleteCursoCascade(c.id);
      } catch (err) {
        console.error('Erro ao excluir curso durante cascade de categoria:', err);
      }
    }));
  } catch (err) {
    console.error('Erro ao buscar/excluir cursos da categoria (cascade):', err);
  }

  return deleteCategoria(id);
};

//////////////////////////////////////

export const getCursos = () =>
  api.get<Cursos[]>('/cursos');

export const getTrilhas = () =>
  api.get<Trilhas[]>('/trilhas');

export const createTrilha = (trilha: Omit<Trilhas, 'id'>) =>
  api.post<Trilhas>('/trilhas', trilha);

export const deleteTrilha = (id: string) =>
  api.delete(`/trilhas/${id}`);

export const deleteTrilhaCascade = async (id: string) => {
  try {
    const linksResp = await getTrilhasCursos(id);
    const links = linksResp.data || [];
    await Promise.all(links.map((l) => api.delete(`/trilhasCursos/${l.id}`)));
  } catch (err) {
    console.error('Erro ao excluir links de trilha (cascade):', err);
  }
  return deleteTrilha(id);
};

export const getTrilhasCursos = (idTrilha: string) =>
  api.get<TrilhasCursos[]>('/trilhasCursos', { params: { idTrilha } });

export const createTrilhaCurso = (link: Omit<TrilhasCursos, 'id'>) =>
  api.post<TrilhasCursos>('/trilhasCursos', link);

export const deleteTrilhaCurso = (id: string) =>
  api.delete(`/trilhasCursos/${id}`);

