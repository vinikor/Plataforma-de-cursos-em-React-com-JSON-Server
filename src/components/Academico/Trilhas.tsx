import { useEffect, useState } from "react";
import type { Trilhas, CreateTrilha, Cursos, TrilhasCursos, CreateTrilhaCurso } from "../../models/Academico";
import { getTrilhas, createTrilha, deleteTrilhaCascade, getTrilhasCursos, createTrilhaCurso, deleteTrilhaCurso } from "../../services/academicoService";
import { getCursos } from "../../services/academicoService";

export default function Trilhas() {
  const [trilhas, setTrilhas] = useState<Trilhas[]>([]);
  const [trilhaCursoTitles, setTrilhaCursoTitles] = useState<Record<string, string[]>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newTrilha, setNewTrilha] = useState<CreateTrilha>({ Titulo: "", Descricao: "", idCategoria: "" });
  const [activeTrilha, setActiveTrilha] = useState<Trilhas | null>(null);
  const [courses, setCourses] = useState<Cursos[]>([]);
  const [links, setLinks] = useState<TrilhasCursos[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [order, setOrder] = useState<number>(1);

  useEffect(() => {
    (async () => {
      const cursosData = await loadCursos();
      await loadTrilhas(cursosData);
    })();
  }, []);
  async function loadTrilhas(cursosList?: Cursos[]) {
    try {
      const resp = await getTrilhas();
      setTrilhas(resp.data);
      
      let cursos = cursosList;
      if (!cursos) {
        const cResp = await getCursos();
        cursos = cResp.data;
        setCourses(cursos);
      }
      try {
        const map: Record<string, string[]> = {};
        await Promise.all(resp.data.map(async (t: Trilhas) => {
          const r = await getTrilhasCursos(t.id);
          const links: TrilhasCursos[] = r.data || [];
          map[t.id] = links.map(l => {
            const c = cursos!.find(c => c.id === l.idCurso);
            return c ? c.Titulo : 'Curso removido';
          });
        }));
        setTrilhaCursoTitles(map);
      } catch (inner) {
        console.error('Erro ao carregar títulos de cursos vinculados:', inner);
      }
      return resp.data as Trilhas[];
    } catch (err) {
      console.error('Erro ao carregar trilhas:', err);
      return [] as Trilhas[];
    }
  }

  async function loadCursos() {
    try {
      const resp = await getCursos();
      setCourses(resp.data);
      return resp.data as Cursos[];
    } catch (err) {
      console.error('Erro ao carregar cursos:', err);
      return [] as Cursos[];
    }
  }

  async function openGerenciar(trilha: Trilhas) {
    setActiveTrilha(trilha);
    try {
      const resp = await getTrilhasCursos(trilha.id);
      const data: TrilhasCursos[] = resp.data || [];
      setLinks(data.sort((a, b) => a.Ordem - b.Ordem));
      setOrder((data.reduce((max, l) => Math.max(max, l.Ordem), 0)) + 1);
      setSelectedCourse("");
    } catch (err) {
      console.error('Erro ao carregar links da trilha:', err);
    }
  }

  async function handleCreateTrilha(e: React.FormEvent) {
    e.preventDefault();
    if (!newTrilha.Titulo.trim()) return;
    try {
      const resp = await createTrilha(newTrilha as Omit<Trilhas, 'id'>);
      setTrilhas(prev => [...prev, resp.data]);
      setNewTrilha({ Titulo: "", Descricao: "", idCategoria: "" });
      setIsCreating(false);
    } catch (err) {
      console.error('Erro ao criar trilha:', err);
    }
  }

  async function handleDeleteTrilha(id: string) {
    try {
      await deleteTrilhaCascade(id);
      setTrilhas(prev => prev.filter(t => t.id !== id));
      if (activeTrilha?.id === id) setActiveTrilha(null);
    } catch (err) {
      console.error('Erro ao deletar trilha:', err);
    }
  }

  async function handleAddCourseToTrilha(e: React.FormEvent) {
    e.preventDefault();
    if (!activeTrilha || !selectedCourse) return;
    try {
      const payload: Omit<TrilhasCursos, 'id'> = { idTrilha: activeTrilha.id, idCurso: selectedCourse, Ordem: order };
      await createTrilhaCurso(payload as CreateTrilhaCurso);
      setOrder(prev => prev + 1);
      setSelectedCourse("");
      // Atualiza lista principal e reabre o gerenciador para sincronizar
      const all = await loadTrilhas();
      const updated = all.find(t => t.id === activeTrilha.id);
      if (updated) await openGerenciar(updated);
    } catch (err) {
      console.error('Erro ao adicionar curso na trilha:', err);
    }
  }

  async function handleRemoveLink(id: string) {
    try {
      await deleteTrilhaCurso(id);
      // Atualiza lista principal e reabre o gerenciador para sincronizar
      const all = await loadTrilhas();
      if (activeTrilha) {
        const updated = all.find(t => t.id === activeTrilha.id);
        if (updated) await openGerenciar(updated);
        else setActiveTrilha(null);
      }
    } catch (err) {
      console.error('Erro ao remover link da trilha:', err);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Trilhas</h2>
        <button className="btn btn-primary" onClick={() => setIsCreating(true)}>Nova Trilha</button>
      </div>

      {isCreating && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} className="d-flex justify-content-center align-items-center">
          <div className="card p-4" style={{ width: '100%', maxWidth: '540px' }} role="dialog" aria-modal="true">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">Nova Trilha</h5>
              <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setIsCreating(false)} />
            </div>
            <form onSubmit={handleCreateTrilha}>
              <div className="mb-2">
                <label className="form-label">Título</label>
                <input className="form-control" value={newTrilha.Titulo} onChange={e => setNewTrilha(prev => ({ ...prev, Titulo: e.target.value }))} />
              </div>
              <div className="mb-2">
                <label className="form-label">Descrição</label>
                <input className="form-control" value={newTrilha.Descricao} onChange={e => setNewTrilha(prev => ({ ...prev, Descricao: e.target.value }))} />
              </div>
              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>Cancelar</button>
                <button type="submit" className="btn btn-success">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Título</th>
              <th>Descrição</th>
              <th>Cursos</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {trilhas.map(t => (
            <tr key={t.id}>
              <td>{t.Titulo}</td>
              <td>{t.Descricao}</td>
                <td>
                  {
                    (() => {
                      const titles = trilhaCursoTitles[t.id] || [];
                      if (titles.length === 0) return <span className="text-muted">—</span>;
                      const toShow = titles.slice(0, 3);
                      const extra = titles.length - toShow.length;
                      return (
                        <div>
                          {toShow.map((title, i) => (
                            <span key={i} className="badge bg-light text-dark me-1">{title}</span>
                          ))}
                          {extra > 0 && <span className="text-muted">+{extra} mais</span>}
                        </div>
                      );
                    })()
                  }
                </td>
              <td>
                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openGerenciar(t)}>Gerenciar</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTrilha(t.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {activeTrilha && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} className="d-flex justify-content-center align-items-start pt-5">
          <div className="card p-4" style={{ width: '100%', maxWidth: '900px', maxHeight: '85vh', overflow: 'auto' }} role="dialog" aria-modal="true">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="m-0">Gerenciar Trilha: {activeTrilha.Titulo}</h5>
                <small className="text-muted">{activeTrilha.Descricao}</small>
              </div>
              <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setActiveTrilha(null)} />
            </div>

            <form className="row g-3 mb-3" onSubmit={handleAddCourseToTrilha}>
              <div className="col-md-6">
                <label className="form-label">Curso</label>
                <select className="form-select" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                  <option value="">Selecione um curso</option>
                  {courses.filter(c => !links.some(l => l.idCurso === c.id)).map(c => (
                    <option key={c.id} value={c.id}>{c.Titulo}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Ordem</label>
                <input type="number" min={1} className="form-control" value={order} onChange={e => setOrder(Number(e.target.value))} />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button type="submit" className="btn btn-success">Adicionar curso à trilha</button>
              </div>
            </form>

            <div>
              <h6 className="mb-3">Cursos vinculados</h6>
              {links.length === 0 ? (
                <div className="alert alert-secondary">Nenhum curso vinculado a esta trilha.</div>
              ) : (
                <div>
                  {links.map(l => {
                    const curso = courses.find(c => c.id === l.idCurso);
                    return (
                      <div key={l.id} className="card mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="card-title mb-2">{curso?.Titulo ?? 'Curso removido'}</h6>
                              <small className="text-muted">Ordem: {l.Ordem}</small>
                            </div>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveLink(l.id)}
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}