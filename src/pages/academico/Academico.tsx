import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Navbar/Sidebar";
import { useState } from 'react';
import './Academico.css';
import Categorias from "../../components/Academico/Categorias";
import Trilhas from "../../components/Academico/Trilhas";
import Cursos from "../../components/Academico/Cursos";

type TabKey = 'categorias' | 'cursos' | 'trilhas';

export default function Academico() {

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>('categorias');

  const renderActiveTab = () => {
    if (activeTab === 'categorias') return <Categorias />;
    if (activeTab === 'cursos') return <Cursos />;
    if (activeTab === 'trilhas') return <Trilhas />;
    return null;
  };

  return (
    <>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="container mt-4">
        <div>
          <h1>Módulo Acadêmico</h1>
          <p>Gerencie categorias, cursos e trilhas</p>
        </div>
        <div className="d-flex border-bottom pb-3">
          <button
            type="button"
            className={`btn border btn-academico ${activeTab === 'categorias' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('categorias')}
          >
            Categorias
          </button>
          <button
            type="button"
            className={`btn border btn-academico mx-3 ${activeTab === 'cursos' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('cursos')}
          >
            Cursos
          </button>
          <button
            type="button"
            className={`btn border btn-academico ${activeTab === 'trilhas' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('trilhas')}
          >
            Trilhas
          </button>
        </div>
      </div>

      <div className="container mt-4">
        {renderActiveTab()}
      </div>

    </>
  );
}