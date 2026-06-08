import { useState } from "react";
import Sidebar from "../../../components/Navbar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { createUsuario, getUsuarioByEmail } from "../../../services/usuarioService";


export default function CadastrarUsuario() {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isInstrutor, setIsInstrutor] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

    // Validação de email
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validação de nome (mínimo 3 caracteres)
    const validateName = (name: string): boolean => {
        return name.trim().length >= 3;
    };

    // Validação de senha (mínimo 6 caracteres)
    const validatePassword = (password: string): boolean => {
        return password.length >= 6;
    };

    // Validar todos os campos
    const validateForm = (): boolean => {
        const newErrors: { name?: string; email?: string; password?: string } = {};

        if (!validateName(name)) {
            newErrors.name = "Nome deve ter no mínimo 3 caracteres";
        }

        if (!validateEmail(email)) {
            newErrors.email = "Email inválido";
        }

        if (!validatePassword(password)) {
            newErrors.password = "Senha deve ter no mínimo 6 caracteres";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();


        if (validateForm()) {


            const { data } = await getUsuarioByEmail(email);
            if (data.length > 0) {
                setErrors({ email: 'Este e-mail já está cadastrado.' });
                return;
            }

            console.log("Usuário cadastrado:", { name, email, password });
            await createUsuario({
                id: "", // O ID será gerado pelo backend
                NomeCompleto: name,
                Email: email,
                SenhaHash: password,
                DataCadastro: new Date().toISOString(),
                isInstrutor: isInstrutor,
            });

            // Após sucesso, redirecionar para a lista de usuários

            setName("");
            setEmail("");
            setPassword("");
            setIsInstrutor(false);
            setErrors({});

            navigate("/usuarios");

        }
    };
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

    return (
        <>
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6">
                        <h1 className="text-center">Cadastrar Usuário</h1>
                        <p className="text-center">Formulário para cadastrar um novo usuário.</p>
                        <form className="bg-light p-4 rounded border" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Nome</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    id="name"
                                    placeholder="Digite seu Nome"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    id="email"
                                    placeholder="Digite seu Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Senha</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    id="password"
                                    placeholder="Digite sua Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">É instrutor?</label>
                                <div>
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="isInstrutor"
                                            id="instrutorSim"
                                            checked={isInstrutor === true}
                                            onChange={() => setIsInstrutor(true)}
                                        />
                                        <label className="form-check-label" htmlFor="instrutorSim">Sim</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="isInstrutor"
                                            id="instrutorNao"
                                            checked={isInstrutor === false}
                                            onChange={() => setIsInstrutor(false)}
                                        />
                                        <label className="form-check-label" htmlFor="instrutorNao">Não</label>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex flex-column align-items-center">
                                <button type="submit" className="btn btn-success mb-2 w-100">Cadastrar</button>
                                <a href="/usuarios" className="btn btn-danger w-100">Cancelar</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}