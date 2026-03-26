import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api, { getSession } from "../services/api";
import Sidebar from "../components/sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import {
    UserPlus, Search, ShieldCheck, Mail,
    Key, User, Trash2, ShieldAlert, CheckCircle
} from "lucide-react";
import "../styles/Usuarios.css";

export default function UsuariosPage() {
    const session = getSession();
    const rolSesion = session?.rol;

    // Estados de datos
    const [usuarios, setUsuarios] = useState([]);
    const [empleadosSinUsuario, setEmpleadosSinUsuario] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de UI
    const [mostrarModal, setMostrarModal] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [filtroRol, setFiltroRol] = useState("");

    // Estado para nuevo usuario
    const [nuevoUsuario, setNuevoUsuario] = useState({
        empleado_id: "",
        email: "",
        password: "",
        rol: "supervisor",
    });

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [resUsuarios, resEmpleados] = await Promise.all([
                api.get("/usuarios"),
                api.get("/empleados/sin-usuario")
            ]);
            setUsuarios(resUsuarios.data);
            setEmpleadosSinUsuario(resEmpleados.data);
        } catch (err) {
            console.error("Error al cargar datos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (rolSesion === "admin") cargarDatos();
    }, [rolSesion]);

    // Seguridad: Solo Admin
    if (rolSesion !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/usuarios", nuevoUsuario);
            setMostrarModal(false);
            setNuevoUsuario({ empleado_id: "", email: "", password: "", rol: "supervisor" });
            cargarDatos();
            alert("Acceso creado correctamente");
        } catch (err) {
            alert(err.response?.data?.error || "Error al crear el usuario");
        }
    };

    const eliminarUsuario = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este acceso? El empleado ya no podrá entrar al sistema.")) {
            try {
                await api.delete(`/usuarios/${id}`);
                cargarDatos();
            } catch (err) {
                alert("Error al eliminar");
            }
        }
    };

    const usuariosFiltrados = usuarios.filter((u) => {
        const coincidenciaTexto = u.email.toLowerCase().includes(busqueda.toLowerCase());
        const coincidenciaRol = filtroRol ? u.rol === filtroRol : true;
        return coincidenciaTexto && coincidenciaRol;
    });

    return (
        <div className="dashboard-wrapper">
            <Sidebar />
            <div className="main-content">
                <Topbar />
                <div className="content-padding">

                    <div className="page-header">
                        <div>
                            <h1>Cuentas de Acceso</h1>
                            <p>Gestión de credenciales y permisos de seguridad.</p>
                        </div>
                        <button className="btn-primary" onClick={() => setMostrarModal(true)}>
                            <UserPlus size={20} />
                            <span>Nuevo Usuario</span>
                        </button>
                    </div>

                    <div className="table-toolbar">
                        <div className="search-container">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por email..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <select
                            className="filter-select"
                            value={filtroRol}
                            onChange={(e) => setFiltroRol(e.target.value)}
                        >
                            <option value="">Todos los roles</option>
                            <option value="admin">Administradores</option>
                            <option value="supervisor">Supervisores</option>
                        </select>
                    </div>

                    <div className="table-card card-container">
                        {loading ? (
                            <div className="loading-state"><div className="spinner"></div></div>
                        ) : (
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Usuario / Email</th>
                                        <th>Nivel de Acceso</th>
                                        <th>ID Empleado</th>
                                        <th className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuariosFiltrados.map((u) => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="user-info-cell">
                                                    <div className="icon-circle"><Mail size={16} /></div>
                                                    <span>{u.email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`role-badge ${u.rol}`}>
                                                    {u.rol === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
                                                    {u.rol}
                                                </span>
                                            </td>
                                            <td><span className="id-tag">#{u.empleado_id}</span></td>
                                            <td className="text-center">
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => eliminarUsuario(u.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL INTEGRADO */}
            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-content card-container">
                        <div className="modal-header">
                            <h2>Crear Acceso al Sistema</h2>
                            <button className="close-btn" onClick={() => setMostrarModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="input-group">
                                <label><User size={16} /> Seleccionar Empleado</label>
                                <select
                                    required
                                    value={nuevoUsuario.empleado_id}
                                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, empleado_id: e.target.value })}
                                >
                                    <option value="">-- Empleados sin cuenta --</option>
                                    {empleadosSinUsuario.map(e => (
                                        <option key={e.id} value={e.id}>{e.nombre} {e.apellido} ({e.cedula})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label><Mail size={16} /> Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="ejemplo@sunsol.com"
                                    value={nuevoUsuario.email}
                                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label><Key size={16} /> Contraseña de Inicio</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                    value={nuevoUsuario.password}
                                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label><ShieldCheck size={16} /> Rol Asignado</label>
                                <select
                                    value={nuevoUsuario.rol}
                                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
                                >
                                    <option value="supervisor">Supervisor (Gestión de área)</option>
                                    <option value="admin">Administrador (RRHH Total)</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Habilitar Acceso</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}