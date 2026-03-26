import { Search, Bell, HelpCircle, Menu, X } from "lucide-react";
import { useState } from "react";
import "../styles/Topbar.css";

export default function Topbar({ nombre }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        // También necesitamos comunicar esto al Sidebar
        document.body.classList.toggle('sidebar-open');
    };

    return (
        <header className="topbar">
            {/* Botón Hamburguesa Mejorado */}
            <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Búsqueda Mejorada */}
            <div className="search-wrapper">
                <div className="search-icon-container">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Buscar empleados, documentos, reportes..."
                    className="search-input"
                />
            </div>

            {/* Acciones del Usuario */}
            <div className="user-actions">
                <button className="action-btn" title="Centro de ayuda">
                    <HelpCircle size={20} />
                </button>

                <button className="action-btn notification-btn" title="Notificaciones">
                    <Bell size={20} />
                    <span className="notification-count">3</span>
                </button>

                {/* Perfil del Usuario */}
                <div className="user-profile">
                    <div className="avatar-wrapper">
                        <div className="user-avatar">
                            {nombre?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-status-dot" />
                    </div>
                    <div className="user-info">
                        <span className="user-greeting">Hola,</span>
                        <span className="user-name">{nombre?.split(' ')[0] || 'Usuario'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}