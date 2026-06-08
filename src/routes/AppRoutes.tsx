import { Routes, Route } from "react-router-dom";

import Home from "../pages/home/Home";
import Usuarios from "../pages/usuarios/Usuarios";
import Academico from "../pages/academico/Academico";
import Curso from "../pages/academico/curso/Curso";
import CadastrarUsuario from "../pages/usuarios/cadastrar-usuario/Cadastrar-usuario";
import Matriculas from "../pages/matriculas/Matriculas";
import Planos from "../pages/planos/planos";
import Assinaturas from "../pages/assinaturas/Assinaturas";
import Pagamentos from "../pages/pagamentos/Pagamentos";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/usuarios" element={<Usuarios />} />
      <Route path="/academico" element={<Academico />} />
      <Route path="/academico/curso/:id" element={<Curso />} />
      <Route path="/usuarios/cadastrar-usuario" element={<CadastrarUsuario />} />
      <Route path="/matriculas" element={<Matriculas />} />
      <Route path="/planos" element={<Planos />} />
      <Route path="/assinaturas" element={<Assinaturas />} />
      <Route path="/pagamentos" element={<Pagamentos />} />
    </Routes>
  );
}