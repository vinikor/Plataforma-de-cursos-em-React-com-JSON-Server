import { List, PersonVideo3 } from 'react-bootstrap-icons';
import './Navbar.css';

export default function Navbar({ onMenuClick }: any) {
    return (

        <div className=" d-flex align-items-center navbar navbar-expand-lg navbar-light bg-light border-bottom">

            <button className="navbar-button" onClick={onMenuClick}>
                <List className="text-dark m-2" size={32} />
            </button>
            <PersonVideo3 className="text-primary m-2" size={32} />
            <a className="navbar-brand" href="/">
                Plataforma de Cursos
            </a>
        </div>



    );
}