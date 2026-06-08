import Sidebar from "../../components/Navbar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { useState, useEffect } from "react";
import type { Plano } from "../../models/Planos";
import {
  getPlanos,
  deletePlano,
  createPlano,
  updatePlano,
} from "../../services/planosService";

export default function Planos() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    Nome: "",
    Descricao: "",
    Preco: "",
    DuracaoMeses: "",
  });

  useEffect(() => {
    loadPlanos();
  }, []);

  const loadPlanos = () => {
    getPlanos()
      .then((response) => setPlanos(response.data))
      .catch((error) => {
        console.error("Erro ao buscar planos:", error);
        showNotification("Erro ao carregar planos", "error");
      });
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const openModal = (plano?: Plano) => {
    if (plano) {
      setEditingId(plano.ID_Plano);
      setForm({
        Nome: plano.Nome,
        Descricao: plano.Descricao || "",
        Preco: plano.Preco.toString(),
        DuracaoMeses: plano.DuracaoMeses.toString(),
      });
    } else {
      setEditingId(null);
      setForm({ Nome: "", Descricao: "", Preco: "", DuracaoMeses: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      Nome: form.Nome,
      Descricao: form.Descricao,
      Preco: parseFloat(form.Preco),
      DuracaoMeses: parseInt(form.DuracaoMeses),
    };

    if (editingId) {
      updatePlano(editingId, data)
        .then(() => {
          loadPlanos();
          showNotification("Plano atualizado com sucesso!", "success");
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Erro ao atualizar plano:", error);
          showNotification("Erro ao atualizar plano!", "error");
        });
    } else {
      createPlano(data)
        .then(() => {
          loadPlanos();
          showNotification("Plano criado com sucesso!", "success");
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Erro ao criar plano:", error);
          showNotification("Erro ao criar plano!", "error");
        });
    }
  };

  const handleDelete = (planoId: string, planoNome: string) => {
    if (confirm(`Tem certeza que deseja excluir o plano "${planoNome}"?`)) {
      deletePlano(planoId)
        .then(() => {
          setPlanos((prev) => prev.filter((p) => p.ID_Plano !== planoId));
          showNotification(`Plano "${planoNome}" foi excluído com sucesso!`, "success");
        })
        .catch((error) => {
          console.error("Erro ao excluir plano:", error);
          showNotification("Erro ao excluir plano!", "error");
        });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
            <h1>Planos</h1>
            <p className="text-muted">Gerenciamento dos planos de assinatura.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => openModal()}
          >
            + Novo Plano
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Preço</th>
                <th>Duração (meses)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {planos.length > 0 ? (
                planos.map((plano) => (
                  <tr key={plano.ID_Plano}>
                    <td>{plano.ID_Plano}</td>
                    <td>{plano.Nome}</td>
                    <td>{plano.Descricao || "-"}</td>
                    <td>{formatCurrency(plano.Preco)}</td>
                    <td>{plano.DuracaoMeses}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => openModal(plano)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          handleDelete(plano.ID_Plano, plano.Nome)
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
                    Nenhum plano cadastrado
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
                  {editingId ? "Editar Plano" : "Novo Plano"}
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
                    <label htmlFor="nome" className="form-label">
                      Nome *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nome"
                      value={form.Nome}
                      onChange={(e) =>
                        setForm({ ...form, Nome: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="descricao" className="form-label">
                      Descrição
                    </label>
                    <textarea
                      className="form-control"
                      id="descricao"
                      rows={3}
                      value={form.Descricao}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          Descricao: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="preco" className="form-label">
                      Preço *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="preco"
                      value={form.Preco}
                      onChange={(e) =>
                        setForm({ ...form, Preco: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="duracao" className="form-label">
                      Duração (meses) *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="duracao"
                      value={form.DuracaoMeses}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          DuracaoMeses: e.target.value,
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
