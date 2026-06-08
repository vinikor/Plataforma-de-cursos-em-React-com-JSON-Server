import { Mortarboard, House, People , PersonBadge, CreditCard, CheckCircle } from 'react-bootstrap-icons';
import './Navbar.css';

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <>
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0,
                        zIndex: 40,
                    }}
                />
            )}

            <nav className="d-flex flex-column p-3 shadow bg-white " id="navbarLeft"
                style={{
                    position: 'fixed', top: 69, left: 0, bottom: 0,
                    width: 360, background: '#fff',
                    borderRight: '1px solid #eee',
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.25s ease',
                    zIndex: 50, padding: '8px 0',
                }}>

                <a href="/" className="nav-link m-2 btn-link">
                    <House className="text-dark m-3" size={32} />
                    <span>Home</span>
                </a>
                <a href="/academico" className="nav-link m-2 btn-link">
                    <Mortarboard className="text-dark m-3" size={32} />
                    <span>Acadêmico</span>
                </a>
                <a href="/usuarios" className="nav-link m-2 btn-link">
                    <People className="text-dark m-3" size={32} />
                    <span>Usuários</span>
                </a>
                <a href="/matriculas" className="nav-link m-2 btn-link">
                    <PersonBadge className="text-dark m-3" size={32} />
                    <span>Matrículas</span>
                </a>
                <a href="/planos" className="nav-link m-2 btn-link">
                    <CreditCard className="text-dark m-3" size={32} />
                    <span>Planos</span>
                </a>
                <a href="/assinaturas" className="nav-link m-2 btn-link">
                    <CheckCircle className="text-dark m-3" size={32} />
                    <span>Assinaturas</span>
                </a>
                <a href="/pagamentos" className="nav-link m-2 btn-link">
                    <CreditCard className="text-dark m-3" size={32} />
                    <span>Pagamentos</span>
                </a>


            </nav>
        </>
    );
}