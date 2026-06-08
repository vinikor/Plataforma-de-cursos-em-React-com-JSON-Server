import Navbar from "../../components/Navbar/Navbar";
import { useState } from 'react';
import Sidebar from "../../components/Navbar/Sidebar";
export default function Home() {

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)


  return (
    <div>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="container mt-4">
        <h1>Plataforma de Cursos</h1>
        <p>Sistema de gerenciamento de cursos online.</p>
      </div>
    </div>
  );
}