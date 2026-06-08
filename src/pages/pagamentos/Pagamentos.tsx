import Sidebar from "../../components/Navbar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { useState, useEffect } from "react";
import type { Pagamento } from "../../models/Planos";
import {
  getPagamentos,
  deletePagamento,
  createPagamento,
  updatePagamento,
} from "../../services/planosService";

export default function Pagamentos() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    ID_Assinatura: "",
    ValorPago: "",
    DataPagamento: "",
    MetodoPagamento: "",
    Id_Transacao_Gateway: "",
    DataFim: "",
  });

  useEffect(() => {
    loadPagamentos();
  }, []);

  const loadPagamentos = () => {
    getPagamentos()
      .then((response) => setPagamentos(response.data))
      .catch((error) => {
        console.error("Erro ao buscar pagamentos:", error);
        showNotification("Erro ao carregar pagamentos", "error");
      });
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const openModal = (pagamento?: Pagamento) => {
    if (pagamento) {
      setEditingId(pagamento.ID_Pagamento);
      setForm({
        ID_Assinatura: pagamento.ID_Assinatura,
        ValorPago: pagamento.ValorPago.toString(),
        DataPagamento: pagamento.DataPagamento,
        MetodoPagamento: pagamento.MetodoPagamento,
        Id_Transacao_Gateway: pagamento.Id_Transacao_Gateway,
        DataFim: pagamento.DataFim,
      });
    } else {
      setEditingId(null);
      setForm({
        ID_Assinatura: "",
        ValorPago: "",
        DataPagamento: "",
        MetodoPagamento: "",
        Id_Transacao_Gateway: "",
        DataFim: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ID_Assinatura: form.ID_Assinatura,
      ValorPago: parseFloat(form.ValorPago),
      DataPagamento: form.DataPagamento,
      MetodoPagamento: form.MetodoPagamento,
      Id_Transacao_Gateway: form.Id_Transacao_Gateway,
      DataFim: form.DataFim,
    };

    if (editingId) {
      updatePagamento(editingId, data)
        .then(() => {
          loadPagamentos();
          showNotification("Pagamento atualizado com sucesso!", "success");
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Erro ao atualizar pagamento:", error);
          showNotification("Erro ao atualizar pagamento!", "error");
        });
    } else {
      createPagamento(data)
        .then(() => {
          loadPagamentos();
          showNotification("Pagamento criado com sucesso!", "success");
          setShowModal(false);
        })
        .catch((error) => {
          console.error("Erro ao criar pagamento:", error);
          showNotification("Erro ao criar pagamento!", "error");
        });
    }
  };

  const handleDelete = (pagamentoId: string) => {
    if (confirm("Tem certeza que deseja excluir este pagamento?")) {
      deletePagamento(pagamentoId)
        .then(() => {
          setPagamentos((prev) =>
            prev.filter((p) => p.ID_Pagamento !== pagamentoId)
          );
          showNotification("Pagamento foi excluído com sucesso!", "success");
        })
        .catch((error) => {
          console.error("Erro ao excluir pagamento:", error);
          showNotification("Erro ao excluir pagamento!", "error");
        });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
            <h1>Pagamentos</h1>
            <p className="text-muted">Gerenciamento de pagamentos.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => openModal()}
          >
            + Novo Pagamento
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>ID Assinatura</th>
                <th>Valor Pago</th>
                <th>Data Pagamento</th>
                <th>Método</th>
                <th>ID Transação</th>
                <th>Data Fim</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pagamentos.length > 0 ? (
                pagamentos.map((pagamento) => (
                  <tr key={pagamento.ID_Pagamento}>
                    <td>{pagamento.ID_Pagamento}</td>
                    <td>{pagamento.ID_Assinatura}</td>
                    <td>{formatCurrency(pagamento.ValorPago)}</td>
                    <td>{formatDate(pagamento.DataPagamento)}</td>
                    <td>{pagamento.MetodoPagamento}</td>
                    <td>{pagamento.Id_Transacao_Gateway}</td>
                    <td>{formatDate(pagamento.DataFim)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => openModal(pagamento)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          handleDelete(pagamento.ID_Pagamento)
                        }
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-muted">
                    Nenhum pagamento cadastrado
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
                  {editingId ? "Editar Pagamento" : "Novo Pagamento"}
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
                    <label htmlFor="idAssinatura" className="form-label">
                      ID Assinatura *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="idAssinatura"
                      value={form.ID_Assinatura}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          ID_Assinatura: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="valorPago" className="form-label">
                      Valor Pago *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      id="valorPago"
                      value={form.ValorPago}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          ValorPago: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="dataPagamento" className="form-label">
                      Data Pagamento *
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="dataPagamento"
                      value={form.DataPagamento}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          DataPagamento: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="metodo" className="form-label">
                      Método *
                    </label>
                    <select
                      className="form-control"
                      id="metodo"
                      value={form.MetodoPagamento}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          MetodoPagamento: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Selecione um método</option>
                      <option value="Cartão de Crédito">
                        Cartão de Crédito
                      </option>
                      <option value="Boleto">Boleto</option>
                      <option value="Pix">Pix</option>
                      <option value="Transferência Bancária">
                        Transferência Bancária
                      </option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="idTransacao" className="form-label">
                      ID Transação Gateway *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="idTransacao"
                      value={form.Id_Transacao_Gateway}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          Id_Transacao_Gateway: e.target.value,
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
