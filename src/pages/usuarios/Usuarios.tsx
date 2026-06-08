import Sidebar from "../../components/Navbar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { useState, useEffect } from "react";
import type { Usuario } from "../../models/Usuario";
import { getUsuarios, deleteUsuario } from "../../services/usuarioService";




export default function Usuarios() {

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [notification, setNotification] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

    useEffect(() => {
        getUsuarios()
            .then((response) => {
                setUsuarios(response.data);

            })
            .catch((error) => {
                console.error("Erro ao buscar usuários:", error);
            });
    }, []);

    const handleDeleteUsuario = (usuarioId: string, usuarioNome: string) => {
        deleteUsuario(usuarioId)
            .then(() => {
                setUsuarios((prev) => prev.filter((u) => u.id !== usuarioId));
                setNotification({ show: true, message: `Usuário "${usuarioNome}" foi excluído com sucesso!` });
                
                // Esconder notificação após 3 segundos
                setTimeout(() => {
                    setNotification({ show: false, message: "" });
                }, 3000);
            })
            .catch((error) => {
                console.error("Erro ao excluir usuário:", error);
                setNotification({ show: true, message: "Erro ao excluir usuário!" });
                setTimeout(() => {
                    setNotification({ show: false, message: "" });
                }, 3000);
            });
    };

    return (
        <>
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {notification.show && (
                <div className="container mt-3">
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        {notification.message}
                        <button type="button" className="btn-close" onClick={() => setNotification({ show: false, message: "" })}></button>
                    </div>
                </div>
            )}

            <div className="container mt-4 ">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1>Usuários</h1>
                        <p>Gerenciamento dos usuários da plataforma.</p>
                    </div>
                    <a href="/usuarios/cadastrar-usuario" className="btn btn-primary">
                        Cadastrar Usuário
                    </a>
                </div>

                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome Completo</th>
                                <th>Email</th>
                                <th>Data de Cadastro</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id}>
                                    <td>{usuario.id}</td>
                                    <td>{usuario.NomeCompleto}</td>
                                    <td>{usuario.Email}</td>
                                    <td>{usuario.DataCadastro}</td>
                                    <td>
                                        <button onClick={() => handleDeleteUsuario(usuario.id, usuario.NomeCompleto)} className="btn btn-sm btn-outline-danger">
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </>
    );
}