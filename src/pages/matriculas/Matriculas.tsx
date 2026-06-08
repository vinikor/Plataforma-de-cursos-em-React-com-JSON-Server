
import { useEffect, useState } from "react";
import Sidebar from "../../components/Navbar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import type { Usuario } from "../../models/Usuario";
import type { Cursos } from "../../models/Academico";
import type { Matricula } from "../../models/matricula";
import { getUsuarios } from "../../services/usuarioService";
import { getCursos } from "../../services/academicoService";
import { getMatriculas, createMatricula } from "../../services/matriculaService";

export default function Matriculas() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Cursos[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<string>("");
  const [selectedCursoId, setSelectedCursoId] = useState<string>("");
  const [notification, setNotification] = useState<{ show: boolean; message: string; variant: "success" | "danger" }>(
    { show: false, message: "", variant: "success" }
  );

  const loadData = async () => {
    try {
      const [usuariosResponse, cursosResponse, matriculasResponse] = await Promise.all([
        getUsuarios(),
        getCursos(),
        getMatriculas(),
      ]);

      setUsuarios(usuariosResponse.data);
      setCursos(cursosResponse.data);
      setMatriculas(matriculasResponse);
    } catch (error) {
      console.error("Erro ao carregar dados de matrícula:", error);
      setNotification({ show: true, message: "Erro ao carregar dados. Tente novamente mais tarde.", variant: "danger" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedUsuarioId || !selectedCursoId) {
      setNotification({ show: true, message: "Selecione usuário e curso antes de matricular.", variant: "danger" });
      return;
    }

    const matriculaExistente = matriculas.some(
      (matricula) => matricula.idUsuario === selectedUsuarioId && matricula.idCurso === selectedCursoId
    );

    if (matriculaExistente) {
      setNotification({ show: true, message: "Este usuário já está matriculado neste curso.", variant: "danger" });
      return;
    }

    const novaMatricula: Matricula = {
      idUsuario: selectedUsuarioId,
      idCurso: selectedCursoId,
      DataMatricula: new Date().toISOString(),
      Dataconclusao: null,
    };

    try {
      await createMatricula(novaMatricula);
      setNotification({ show: true, message: "Matrícula criada com sucesso!", variant: "success" });
      setSelectedCursoId("");
      setSelectedUsuarioId("");
      loadData();
    } catch (error) {
      console.error("Erro ao criar matrícula:", error);
      setNotification({ show: true, message: "Falha ao criar matrícula. Verifique os dados e tente novamente.", variant: "danger" });
    }
  };

  const getUsuarioNome = (id: string) => usuarios.find((usuario) => usuario.id === id)?.NomeCompleto ?? "Usuário não encontrado";
  const getCursoTitulo = (id: string) => cursos.find((curso) => curso.id === id)?.Titulo ?? "Curso não encontrado";

  return (
    <>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1>Matrículas</h1>
            <p>Matricule usuários em cursos disponíveis e acompanhe as inscrições.</p>
          </div>
        </div>

        {notification.show && (
          <div className={`alert alert-${notification.variant === "success" ? "success" : "danger"} alert-dismissible fade show`} role="alert">
            {notification.message}
            <button type="button" className="btn-close" onClick={() => setNotification({ show: false, message: "", variant: "success" })}></button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-4 mb-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Usuário</label>
              <select className="form-select" value={selectedUsuarioId} onChange={(event) => setSelectedUsuarioId(event.target.value)}>
                <option value="">Selecione um usuário</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.NomeCompleto} ({usuario.Email})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Curso</label>
              <select className="form-select" value={selectedCursoId} onChange={(event) => setSelectedCursoId(event.target.value)}>
                <option value="">Selecione um curso</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.Titulo} - {curso.Nivel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-end">
            <button type="submit" className="btn btn-primary">
              Matricular
            </button>
          </div>
        </form>

        <div className="card p-4">
          <h2 className="h5 mb-3">Matrículas existentes</h2>
          {matriculas.length === 0 ? (
            <p>Nenhuma matrícula cadastrada ainda.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Curso</th>
                    <th>Data da Matrícula</th>
                    <th>Data de Conclusão</th>
                  </tr>
                </thead>
                <tbody>
                  {matriculas.map((matricula, index) => (
                    <tr key={`${matricula.idUsuario}-${matricula.idCurso}-${index}`}>
                      <td>{getUsuarioNome(matricula.idUsuario)}</td>
                      <td>{getCursoTitulo(matricula.idCurso)}</td>
                      <td>{new Date(matricula.DataMatricula).toLocaleDateString()}</td>
                      <td>{matricula.Dataconclusao ? new Date(matricula.Dataconclusao).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
