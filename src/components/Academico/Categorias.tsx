import { useState, useEffect } from "react";
import type { Categorias, CreateCategoria } from "../../models/Academico";
import { createCategoria, getCategorias, getCursos, deleteCategoriaCascade } from "../../services/academicoService";
import type { Cursos } from "../../models/Academico";

export default function Categorias() {
    const [categorias, setCategorias] = useState<Categorias[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newCategoria, setNewCategoria] = useState<CreateCategoria>({ Nome: "", Descricao: "" });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingCategory, setPendingCategory] = useState<{ id: string; Nome: string } | null>(null);
    const [linkedCoursesCount, setLinkedCoursesCount] = useState<number>(0);

    async function handleDelete(id: string) {
        try {
            await deleteCategoriaCascade(id);
            setCategorias(prev => prev.filter(cat => cat.id !== id));
            setConfirmOpen(false);
            setPendingCategory(null);
            setLinkedCoursesCount(0);
        } catch (error) {
            console.error("Erro ao deletar categoria:", error);
        }
    }

    async function confirmDelete(categoria: { id: string; Nome: string }) {
        try {
            // conta cursos vinculados
            const response = await getCursos();
            const cursos: Cursos[] = response.data.filter(c => c.idCategoria === categoria.id);
            setLinkedCoursesCount(cursos.length);
            setPendingCategory({ id: categoria.id, Nome: categoria.Nome });
            setConfirmOpen(true);
        } catch (error) {
            console.error('Erro ao verificar cursos vinculados:', error);
         
            setLinkedCoursesCount(0);
            setPendingCategory({ id: categoria.id, Nome: categoria.Nome });
            setConfirmOpen(true);
        }
    }
    
    useEffect(() => {
        getCategorias()
            .then((response) => {
                setCategorias(response.data);
            })
            .catch((error) => {
                console.error("Erro ao buscar categorias:", error);
            });
    }, []);


    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Categorias</h2>
                <button type="button" className="btn btn-primary" onClick={() => setIsCreating(true)}>Nova Categoria</button>
            </div>
            {isCreating && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} className="d-flex justify-content-center align-items-center">
                    <div className="card p-4" style={{ width: '100%', maxWidth: '540px' }} role="dialog" aria-modal="true">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="m-0">Nova Categoria</h5>
                            <button type="button" className="btn-close" aria-label="Fechar" onClick={() => setIsCreating(false)} />
                        </div>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!newCategoria.Nome.trim()) return;
                            try {
                                const response = await createCategoria(newCategoria as Omit<Categorias, 'id'>);
                                setCategorias(prev => [...prev, response.data]);
                                setNewCategoria({ Nome: "", Descricao: "" });
                                setIsCreating(false);
                            } catch (error) {
                                console.error("Erro ao criar categoria:", error);
                            }
                        }}>
                            <div className="mb-2">
                                <label className="form-label">Nome</label>
                                <input
                                    className="form-control"
                                    value={newCategoria.Nome}
                                    onChange={e => setNewCategoria(prev => ({ ...prev, Nome: e.target.value }))}
                                />
                            </div>
                            <div className="mb-2">
                                <label className="form-label">Descrição</label>
                                <input
                                    className="form-control"
                                    value={newCategoria.Descricao}
                                    onChange={e => setNewCategoria(prev => ({ ...prev, Descricao: e.target.value }))}
                                />
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
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {categorias.map((categoria) => (
                        <tr key={categoria.id}>
                            <td>{categoria.Nome}</td>
                            <td>{categoria.Descricao}</td>

                            <td>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => confirmDelete(categoria)}>
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {confirmOpen && pendingCategory && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} className="d-flex justify-content-center align-items-center">
                    <div className="card p-4" style={{ width: '100%', maxWidth: '540px' }} role="dialog" aria-modal="true">
                        <h5>Confirmar exclusão</h5>
                        <p>Você tem certeza que deseja excluir a categoria <strong>{pendingCategory.Nome}</strong>?</p>
                        <p>Isso irá excluir todos os cursos vinculados ({linkedCoursesCount}). Esta ação não pode ser desfeita.</p>
                        <div className="d-flex gap-2 justify-content-end">
                            <button type="button" className="btn btn-secondary" onClick={() => { setConfirmOpen(false); setPendingCategory(null); setLinkedCoursesCount(0); }}>Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={() => handleDelete(pendingCategory.id)}>Excluir categoria e cursos vinculados</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}