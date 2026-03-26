import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, Users, Building2, ClipboardCheck,
    GraduationCap, AlertTriangle, Settings, LogOut, X
} from "lucide-react";
import { getSession, clearSession } from "../services/api";
import { useState, useEffect } from "react";
import "../styles/Sidebar.css";

export default function Sidebar() {
    const { rol } = getSession() || {};
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Detectar cambios en el estado del sidebar desde el body class
    useEffect(() => {
        const handleBodyClassChange = () => {
            setIsOpen(document.body.classList.contains('sidebar-open'));
        };

        // Observar cambios en las clases del body
        const observer = new MutationObserver(handleBodyClassChange);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    // Cerrar sidebar al hacer clic en un enlace (en móviles)
    const handleLinkClick = () => {
        if (window.innerWidth <= 768) {
            document.body.classList.remove('sidebar-open');
            setIsOpen(false);
        }
    };

    // Cerrar sidebar
    const handleCloseSidebar = () => {
        document.body.classList.remove('sidebar-open');
        setIsOpen(false);
    };

    const menuItems = [
        { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} />, roles: ["admin", "supervisor"] },
        { label: "Personal", path: "/empleados", icon: <Users size={20} />, roles: ["admin"] },
        { label: "Departamentos", path: "/departamentos", icon: <Building2 size={20} />, roles: ["admin"] },
        { label: "Evaluaciones", path: "/evaluaciones", icon: <ClipboardCheck size={20} />, roles: ["admin", "supervisor"] },
        { label: "Capacitaciones", path: "/cursos", icon: <GraduationCap size={20} />, roles: ["admin", "supervisor"] },
        { label: "Disciplina", path: "/amonestaciones", icon: <AlertTriangle size={20} />, roles: ["admin", "supervisor"] },
        { label: "Configuración", path: "/configuracion", icon: <Settings size={20} />, roles: ["admin"] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(rol));

    return (
        <>
            {/* Overlay para móviles */}
            {isOpen && <div className="sidebar-overlay" onClick={handleCloseSidebar} />}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Header del Sidebar para móviles */}
                <div className="sidebar-mobile-header">
                    <div className="mobile-logo">
                        <div className="logo-icon">
                            <span className="logo-g">G</span>
                            <span className="logo-rh">RH</span>
                        </div>
                        <span className="mobile-logo-text">Gesto RH</span>
                    </div>
                    <button className="close-sidebar" onClick={handleCloseSidebar}>
                        <X size={24} />
                    </button>
                </div>

                {/* Logo Mejorado (desktop) */}
                <div className="sidebar-brand">
                    <div className="logo-wrapper">
                        <div className="logo-icon">
                            <span className="logo-g">G</span>
                            <span className="logo-rh">RH</span>
                        </div>
                        <div className="logo-text">
                            <span className="logo-name">Gesto</span>
                            <span className="logo-slogan">Recursos Humanos</span>
                        </div>
                    </div>
                </div>

                {/* Menú de Navegación */}
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <p className="section-label">MENÚ PRINCIPAL</p>
                        <div className="nav-items">
                            {filteredItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={handleLinkClick}
                                >
                                    <div className="nav-icon-wrapper">
                                        {item.icon}
                                    </div>
                                    <span className="nav-label">{item.label}</span>
                                    {location.pathname === item.path && (
                                        <div className="nav-active-indicator" />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Footer del Sidebar */}
                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">
                            <div className="avatar-bg">
                                {rol === 'admin' ? 'RH' : 'SP'}
                            </div>
                        </div>
                        <div className="user-info">
                            <p className="user-name">
                                {rol === 'admin' ? 'Recursos Humanos' : 'Supervisor'}
                            </p>
                            <span className="user-status">Conectado</span>
                        </div>
                        <button
                            onClick={() => {
                                handleLinkClick();
                                clearSession();
                            }}
                            className="logout-btn"
                            title="Cerrar sesión"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}