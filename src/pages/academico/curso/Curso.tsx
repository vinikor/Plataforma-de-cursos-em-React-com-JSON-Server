import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import Sidebar from "../../../components/Navbar/Sidebar";
import type { Aulas, CreateAula, CreateModulo, Modulos } from "../../../models/Academico";
import { createAula, createModulo, deleteAula, getAulasByModulo, getModulosByCurso, deleteModuloCascade } from "../../../services/academicoService";
import type { FormEvent } from "react";

const defaultModulo: Omit<CreateModulo, 'idCurso'> = {
  Titulo: '',
  Ordem: 1,
};

const defaultAula: Omit<CreateAula, 'idModulo'> = {
  titulo: '',
  TipoConteudo: 'Vídeo',
  UrlConteudo: '',
  Duracao: 0,
  Ordem: 1,
};

export default function Curso() {
  const { id } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [modulos, setModulos] = useState<Modulos[]>([]);
  const [aulasPorModulo, setAulasPorModulo] = useState<Record<string, Aulas[]>>({});
  const [isCreatingModulo, setIsCreatingModulo] = useState(false);
  const [isCreatingAula, setIsCreatingAula] = useState(false);
  const [selectedModulo, setSelectedModulo] = useState<Modulos | null>(null);
  const [newModulo, setNewModulo] = useState<Omit<CreateModulo, 'idCurso'>>(defaultModulo);
  const [newAula, setNewAula] = useState<Omit<CreateAula, 'idModulo'>>(defaultAula);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    loadModulos(id);
  }, [id]);

  async function loadModulos(courseId: string) {
    try {
      const response = await getModulosByCurso(courseId);
      const modulosData = response.data.sort((a, b) => a.Ordem - b.Ordem);
      setModulos(modulosData);
      await loadAulas(modulosData);
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
    }
  }

  async function loadAulas(modulosData: Modulos[]) {
    const map: Record<string, Aulas[]> = {};
    await Promise.all(
      modulosData.map(async (modulo) => {
        try {
          const response = await getAulasByModulo(modulo.id);
          map[modulo.id] = response.data.sort((a, b) => a.Ordem - b.Ordem);
        } catch (error) {
          console.error('Erro ao carregar aulas do módulo:', modulo.id, error);
          map[modulo.id] = [];
        }
      }),
    );
    setAulasPorModulo(map);
  }

  async function handleCreateModulo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;

    const errors: Record<string, string> = {};
    if (!newModulo.Titulo.trim()) errors.Titulo = 'Título do módulo é obrigatório';
    if (newModulo.Ordem <= 0) errors.Ordem = 'Ordem deve ser maior que zero';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await createModulo({ ...newModulo, idCurso: id });
      await loadModulos(id);
      setIsCreatingModulo(false);
      setNewModulo(defaultModulo);
      setFormErrors({});
    } catch (error) {
      console.error('Erro ao criar módulo:', error);
    }
  }

  async function handleCreateAula(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedModulo) return;

    const errors: Record<string, string> = {};
    if (!newAula.titulo.trim()) errors.titulo = 'Título da aula é obrigatório';
    if (!newAula.TipoConteudo.trim()) errors.TipoConteudo = 'Tipo de conteúdo é obrigatório';
    if (!newAula.UrlConteudo.trim()) errors.UrlConteudo = 'URL do conteúdo é obrigatória';
    if (newAula.Duracao <= 0) errors.Duracao = 'Duração deve ser maior que zero';
    if (newAula.Ordem <= 0) errors.Ordem = 'Ordem deve ser maior que zero';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await createAula({ ...newAula, idModulo: selectedModulo.id });
      if (id) {
        await loadModulos(id);
      }
      setIsCreatingAula(false);
      setSelectedModulo(null);
      setNewAula(defaultAula);
      setFormErrors({});
    } catch (error) {
      console.error('Erro ao criar aula:', error);
    }
  }

  async function handleDeleteModulo(moduloId: string) {
    try {
      await deleteModuloCascade(moduloId);
      if (id) await loadModulos(id);
    } catch (error) {
      console.error('Erro ao excluir módulo:', error);
    }
  }

  async function handleDeleteAula(aulaId: string) {
    if (!id) return;
    try {
      await deleteAula(aulaId);
      await loadModulos(id);
    } catch (error) {
      console.error('Erro ao excluir aula:', error);
    }
  }

  function openAulaModal(modulo: Modulos) {
    setSelectedModulo(modulo);
    setNewAula(defaultAula);
    setFormErrors({});
    setIsCreatingAula(true);
  }

  return (
    <>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h1>Curso</h1>
            <p>Gerencie os módulos e aulas deste curso.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => { setIsCreatingModulo(true); setFormErrors({}); }}>
            Adicionar módulo
          </button>
        </div>

        {modulos.length === 0 && (
          <div className="alert alert-info">Nenhum módulo cadastrado para este curso.</div>
        )}

        {modulos.map((modulo) => (
          <div key={modulo.id} className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="card-title mb-1">{modulo.Titulo}</h5>
                  <small>Ordem: {modulo.Ordem}</small>
                </div>
                <div className="btn-group">
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openAulaModal(modulo)}>
                    Adicionar aula
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteModulo(modulo.id)}>
                    Excluir módulo
                  </button>
                </div>
              </div>

              {aulasPorModulo[modulo.id]?.length ? (
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Ordem</th>
                        <th>Título</th>
                        <th>Tipo</th>
                        <th>Duração</th>
                        <th>URL</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aulasPorModulo[modulo.id].map((aula) => (
                        <tr key={aula.id}>
                          <td>{aula.Ordem}</td>
                          <td>{aula.titulo}</td>
                          <td>{aula.TipoConteudo}</td>
                          <td>{aula.Duracao} min</td>
                          <td>
                            <a href={aula.UrlConteudo} target="_blank" rel="noreferrer">Link</a>
                          </td>
                          <td>
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteAula(aula.id)}>
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-secondary mb-0">Nenhuma aula cadastrada neste módulo.</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isCreatingModulo && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1050 }} className="d-flex justify-content-center align-items-center">
          <div className="card p-4" style={{ width: '100%', maxWidth: '600px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">Adicionar Módulo</h5>
              <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setIsCreatingModulo(false)} />
            </div>
            <form onSubmit={handleCreateModulo}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Título do módulo</label>
                  <input
                    className={`form-control ${formErrors.Titulo ? 'is-invalid' : ''}`}
                    value={newModulo.Titulo}
                    onChange={(e) => setNewModulo((prev) => ({ ...prev, Titulo: e.target.value }))}
                  />
                  {formErrors.Titulo && <div className="invalid-feedback d-block">{formErrors.Titulo}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label">Ordem</label>
                  <input
                    type="number"
                    min={1}
                    className={`form-control ${formErrors.Ordem ? 'is-invalid' : ''}`}
                    value={newModulo.Ordem}
                    onChange={(e) => setNewModulo((prev) => ({ ...prev, Ordem: Number(e.target.value) }))}
                  />
                  {formErrors.Ordem && <div className="invalid-feedback d-block">{formErrors.Ordem}</div>}
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreatingModulo(false)}>Cancelar</button>
                <button type="submit" className="btn btn-success">Salvar módulo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreatingAula && selectedModulo && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1050 }} className="d-flex justify-content-center align-items-center">
          <div className="card p-4" style={{ width: '100%', maxWidth: '700px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="m-0">Adicionar Aula</h5>
                <small className="text-muted">Módulo: {selectedModulo.Titulo}</small>
              </div>
              <button type="button" className="btn-close" aria-label="Fechar" onClick={() => { setIsCreatingAula(false); setSelectedModulo(null); }} />
            </div>
            <form onSubmit={handleCreateAula}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Título da aula</label>
                  <input
                    className={`form-control ${formErrors.titulo ? 'is-invalid' : ''}`}
                    value={newAula.titulo}
                    onChange={(e) => setNewAula((prev) => ({ ...prev, titulo: e.target.value }))}
                  />
                  {formErrors.titulo && <div className="invalid-feedback d-block">{formErrors.titulo}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Tipo de conteúdo</label>
                  <select
                    className={`form-select ${formErrors.TipoConteudo ? 'is-invalid' : ''}`}
                    value={newAula.TipoConteudo}
                    onChange={(e) => setNewAula((prev) => ({ ...prev, TipoConteudo: e.target.value }))}
                  >
                    <option value="Vídeo">Vídeo</option>
                    <option value="Texto">Texto</option>
                    <option value="Quiz">Quiz</option>
                    <option value="PDF">PDF</option>
                  </select>
                  {formErrors.TipoConteudo && <div className="invalid-feedback d-block">{formErrors.TipoConteudo}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label">URL do conteúdo</label>
                  <input
                    className={`form-control ${formErrors.UrlConteudo ? 'is-invalid' : ''}`}
                    value={newAula.UrlConteudo}
                    onChange={(e) => setNewAula((prev) => ({ ...prev, UrlConteudo: e.target.value }))}
                  />
                  {formErrors.UrlConteudo && <div className="invalid-feedback d-block">{formErrors.UrlConteudo}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Duração (min)</label>
                  <input
                    type="number"
                    min={1}
                    className={`form-control ${formErrors.Duracao ? 'is-invalid' : ''}`}
                    value={newAula.Duracao}
                    onChange={(e) => setNewAula((prev) => ({ ...prev, Duracao: Number(e.target.value) }))}
                  />
                  {formErrors.Duracao && <div className="invalid-feedback d-block">{formErrors.Duracao}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Ordem</label>
                  <input
                    type="number"
                    min={1}
                    className={`form-control ${formErrors.Ordem ? 'is-invalid' : ''}`}
                    value={newAula.Ordem}
                    onChange={(e) => setNewAula((prev) => ({ ...prev, Ordem: Number(e.target.value) }))}
                  />
                  {formErrors.Ordem && <div className="invalid-feedback d-block">{formErrors.Ordem}</div>}
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsCreatingAula(false); setSelectedModulo(null); }}>Cancelar</button>
                <button type="submit" className="btn btn-success">Salvar aula</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
