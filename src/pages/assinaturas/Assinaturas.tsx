import Sidebar from "../../components/Navbar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { useState, useEffect } from "react";
import type { Assinatura } from "../../models/Planos";
import {
  getAssinaturas,
  deleteAssinatura,
  createAssinatura,
  updateAssinatura,
} from "../../services/planosService";

export default function Assinaturas() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    ID_Usuario: "",
    ID_Plano: "",
    DataInicio: "",
    DataFim: "",
  });

  useEffect(() => {
    loadAssinaturas();
  }, []);

  const loadAssinaturas = () => {
    getAssinaturas()
      .then((response) => setAssinaturas(response.data))
      .catch((error) => {
        console.error("Erro ao buscar assinaturas:", error);
        showNotification("Erro ao carregar assinaturas", "error");
      });
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const openModal = (assinatura?: Assinatura) => {
    if (assinatura) {
      setEditingId(assinatura.ID_Assinatura);
      setForm({
        ID_Usuario: assinatura.ID_Usuario,
        ID_Plano: assinatura.ID_Plano,
        DataInicio: assinatura.DataInicio,
        DataFim: assinatura.DataFim,
      });
    } else {
      setEditingId(null);
      setForm({
        ID_Usuario: "",
        ID_Plano: "",
        DataInicio: "",
        DataFim: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ID_Usuario: form.ID_Usuario,
      ID_Plano: form.ID_Plano,
      DataInicio: form.DataInicio,
      DataFim: form.DataFim,
    };

    if (editingId) {
      updateAssinatura(editingId, data)
        .then(() => {
          loadAssinaturas();
          showNotification("Assinatura atualizada com sucesso!", "success");
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Erro ao atualizar assinatura:", error);
          showNotification("Erro ao atualizar assinatura!", "error");
        });
    } else {
      createAssinatura(data)
        .then(() => {
          loadAssinaturas();
          showNotification("Assinatura criada com sucesso!", "success");
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Erro ao criar assinatura:", error);
          showNotification("Erro ao criar assinatura!", "error");
        });
    }
  };

  const handleDelete = (assinaturaId: string) => {
    if (confirm("Tem certeza que deseja excluir esta assinatura?")) {
      deleteAssinatura(assinaturaId)
        .then(() => {
          setAssinaturas((prev) =>
            prev.filter((a) => a.ID_Assinatura !== assinaturaId)
          );
          showNotification("Assinatura foi excluída com sucesso!", "success");
        })
        .catch((error) => {
          console.error("Erro ao excluir assinatura:", error);
          showNotification("Erro ao excluir assinatura!", "error");
        });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {notification.show && (
        <div className="container mt-3">
          <div
            className={`alert ${
              notification.type === "success"
                ? "alert-success"
                : "alert-danger"
            } alert-dismissible fade show`}
            role="alert"
          >
            {notification.message}
            <button
              type="button"
              className="btn-close"
              onClick={() =>
                setNotification({ show: false, message: "", type: "success" })
              }
            ></button>
          </div>
        </div>
      )}

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1>Assinaturas</h1>
            <p className="text-muted">Gerenciamento das assinaturas de usuários.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => openModal()}
          >
            + Nova Assinatura
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>ID Usuário</th>
                <th>ID Plano</th>
                <th>Data Início</th>
                <th>Data Fim</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {assinaturas.length > 0 ? (
                assinaturas.map((assinatura) => (
                  <tr key={assinatura.ID_Assinatura}>
                    <td>{assinatura.ID_Assinatura}</td>
                    <td>{assinatura.ID_Usuario}</td>
                    <td>{assinatura.ID_Plano}</td>
                    <td>{formatDate(assinatura.DataInicio)}</td>
                    <td>{formatDate(assinatura.DataFim)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => openModal(assinatura)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          handleDelete(assinatura.ID_Assinatura)
                        }
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    Nenhuma assinatura cadastrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? "Editar Assinatura" : "Nova Assinatura"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="idUsuario" className="form-label">
                      ID Usuário *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="idUsuario"
                      value={form.ID_Usuario}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          ID_Usuario: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="idPlano" className="form-label">
                      ID Plano *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="idPlano"
                      value={form.ID_Plano}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          ID_Plano: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="dataInicio" className="form-label">
                      Data Início *
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="dataInicio"
                      value={form.DataInicio}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          DataInicio: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="dataFim" className="form-label">
                      Data Fim *
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="dataFim"
                      value={form.DataFim}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          DataFim: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
