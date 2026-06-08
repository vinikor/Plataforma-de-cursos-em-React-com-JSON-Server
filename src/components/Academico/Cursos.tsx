
import { useNavigate } from "react-router-dom";
import type { Cursos, Categorias, CreateCurso } from "../../models/Academico";
import type { Usuario } from "../../models/Usuario";

import { getCursos, getCategorias, deleteCursoCascade, createCurso } from "../../services/academicoService";
import { getUsuarios } from "../../services/usuarioService";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

const defaultNewCurso: CreateCurso = {
  Titulo: "",
  Descricao: "",
  idInstrutor: "",
  idCategoria: "",
  Nivel: "",
  DataPublicacao: new Date().toISOString().slice(0, 10),
  TotalAulas: 0,
  TotalHoras: 0,
};

export default function Cursos() {
  const [cursos, setCursos] = useState<Cursos[]>([]);
  const [categorias, setCategorias] = useState<Categorias[]>([]);
  const [instrutores, setInstrutores] = useState<Usuario[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCurso, setNewCurso] = useState<CreateCurso>(defaultNewCurso);
  const [formErrors, setFormErrors] = useState<{
    Titulo?: string;
    Nivel?: string;
    idCategoria?: string;
    idInstrutor?: string;
    TotalAulas?: string;
    TotalHoras?: string;
  }>({});

  async function handleDeleteCurso(id: string) {
    try {
      await deleteCursoCascade(id);
      setCursos(prev => prev.filter(curso => curso.id !== id));
    } catch (error) {
      console.error('Erro ao deletar curso:', error);
    }
  }

  async function handleCreateCurso(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: typeof formErrors = {};
    if (!newCurso.Titulo.trim()) {
      errors.Titulo = 'Título é obrigatório';
    }
    if (!newCurso.Nivel) {
      errors.Nivel = 'Nível é obrigatório';
    }
    if (!newCurso.idCategoria) {
      errors.idCategoria = 'Categoria é obrigatória';
    }
    if (!newCurso.idInstrutor) {
      errors.idInstrutor = 'Instrutor é obrigatório';
    }
    if (newCurso.TotalAulas <= 0) {
      errors.TotalAulas = 'Total de aulas deve ser maior que zero';
    }
    if (newCurso.TotalHoras <= 0) {
      errors.TotalHoras = 'Total de horas deve ser maior que zero';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const response = await createCurso(newCurso as Omit<Cursos, 'id'>);
      setCursos(prev => [...prev, response.data]);
      setNewCurso(defaultNewCurso);
      setFormErrors({});
      setIsCreating(false);
    } catch (error) {
      console.error('Erro ao criar curso:', error);
    }
  }

  useEffect(() => {
    getCursos()
      .then((response) => setCursos(response.data))
      .catch((error) => console.error('Erro ao buscar cursos:', error));

    getCategorias()
      .then((response) => setCategorias(response.data))
      .catch((error) => console.error('Erro ao buscar categorias:', error));

    getUsuarios()
      .then((response) => setInstrutores(response.data.filter((usuario) => usuario.isInstrutor)))
      .catch((error) => console.error('Erro ao buscar instrutores:', error));
  }, []);

  const navigate = useNavigate();

  const handleAccessCurso = (id: string) => {
    navigate(`/academico/curso/${id}`);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Cursos</h2>
        <button type="button" className="btn btn-primary" onClick={() => setIsCreating(true)}>Novo Curso</button>
      </div>
      {isCreating && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1050 }} className="d-flex justify-content-center align-items-center">
          <div className="card p-4" style={{ width: '100%', maxWidth: '700px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">Adicionar Novo Curso</h5>
              <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setIsCreating(false)} />
            </div>
            <form onSubmit={handleCreateCurso}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Título</label>
                  <input
                    className="form-control"
                    value={newCurso.Titulo}
                    onChange={e => setNewCurso(prev => ({ ...prev, Titulo: e.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Nível</label>
                  <select
                    className={`form-select ${formErrors.Nivel ? 'is-invalid' : ''}`}
                    value={newCurso.Nivel}
                    onChange={e => setNewCurso(prev => ({ ...prev, Nivel: e.target.value }))}
                  >
                    <option value="">Selecione o nível</option>
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                  {formErrors.Nivel && <div className="invalid-feedback d-block">{formErrors.Nivel}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Categoria</label>
                  <select
                    className={`form-select ${formErrors.idCategoria ? 'is-invalid' : ''}`}
                    value={newCurso.idCategoria}
                    onChange={e => setNewCurso(prev => ({ ...prev, idCategoria: e.target.value }))}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.Nome}</option>
                    ))}
                  </select>
                  {formErrors.idCategoria && <div className="invalid-feedback d-block">{formErrors.idCategoria}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Instrutor</label>
                  <select
                    className={`form-select ${formErrors.idInstrutor ? 'is-invalid' : ''}`}
                    value={newCurso.idInstrutor}
                    onChange={e => setNewCurso(prev => ({ ...prev, idInstrutor: e.target.value }))}
                  >
                    <option value="">Selecione um instrutor</option>
                    {instrutores.map((instrutor) => (
                      <option key={instrutor.id} value={instrutor.id}>{instrutor.NomeCompleto}</option>
                    ))}
                  </select>
                  {formErrors.idInstrutor && <div className="invalid-feedback d-block">{formErrors.idInstrutor}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label">Descrição</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={newCurso.Descricao}
                    onChange={e => setNewCurso(prev => ({ ...prev, Descricao: e.target.value }))}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Publicação</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newCurso.DataPublicacao}
                    onChange={e => setNewCurso(prev => ({ ...prev, DataPublicacao: e.target.value }))}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Total de Aulas</label>
                  <input
                    type="number"
                    className={`form-control ${formErrors.TotalAulas ? 'is-invalid' : ''}`}
                    min={0}
                    value={newCurso.TotalAulas}
                    onChange={e => setNewCurso(prev => ({ ...prev, TotalAulas: Number(e.target.value) }))}
                  />
                  {formErrors.TotalAulas && <div className="invalid-feedback d-block">{formErrors.TotalAulas}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Total de Horas</label>
                  <input
                    type="number"
                    className={`form-control ${formErrors.TotalHoras ? 'is-invalid' : ''}`}
                    min={0}
                    value={newCurso.TotalHoras}
                    onChange={e => setNewCurso(prev => ({ ...prev, TotalHoras: Number(e.target.value) }))}
                  />
                  {formErrors.TotalHoras && <div className="invalid-feedback d-block">{formErrors.TotalHoras}</div>}
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancelar</button>
                <button type="submit" className="btn btn-success">Salvar Curso</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Título</th>
            <th>Categoria</th>
            <th>Nível</th>
            <th>Horas</th>
            <th>Aulas</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {cursos.map((curso) => {
            const categoria = categorias.find((cat) => cat.id === curso.idCategoria);
            return (
              <tr key={curso.id}>
                <td>{curso.Titulo}</td>
                <td>{categoria?.Nome ?? curso.idCategoria}</td>
                <td>{curso.Nivel}</td>
                <td>{curso.TotalHoras}</td>
                <td>{curso.TotalAulas}</td>
                <td>
                  <button onClick={() => handleAccessCurso(curso.id)} type="button" className="btn btn-sm btn-outline-secondary me-2">Acessar</button>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCurso(curso.id)}>Excluir</button>
                </td>
              </tr>
            );
          })}

        </tbody>
      </table>


    </div>
  );
}