import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api, { getSession } from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DepartamentoModal from "../components/DepartamentoModal";
import {
    Building2, Plus, Search, Filter, Users,
    Calendar, ChevronDown, MoreVertical, CheckCircle,
    XCircle, TrendingUp, Download
} from "lucide-react";
import "../styles/departamento.css";

export default function DepartamentosPage() {
    const session = getSession();
    const rolSesion = session?.rol;

    const [departamentos, setDepartamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [mostrarModal, setMostrarModal] = useState(false);
    const [departamentoEditando, setDepartamentoEditando] = useState(null);
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        activos: 0,
        nuevosEsteMes: 0,
        empleadosTotales: 0
    });

    const fetchDepartamentos = async () => {
        setLoading(true);
        try {
            const res = await api.get("/departamentos");
            setDepartamentos(res.data);

            // Calcular estadísticas
            const empleadosTotales = res.data.reduce((sum, depto) =>
                sum + (depto.total_empleados || 0), 0
            );

            setEstadisticas({
                total: res.data.length,
                activos: res.data.filter(d => d.activo).length,
                nuevosEsteMes: 0, // Podrías agregar fecha_creación para calcular esto
                empleadosTotales: empleadosTotales
            });
        } catch (err) {
            console.error("Error al cargar departamentos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (rolSesion === "admin") {
            fetchDepartamentos();
        }
    }, [rolSesion]);

    const abrirModalEditar = (departamento) => {
        setDepartamentoEditando(departamento);
        setMostrarModal(true);
    };

    const abrirModalCrear = () => {
        setDepartamentoEditando(null);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setDepartamentoEditando(null);
    };

    const filteredDepartamentos = departamentos.filter(d =>
        d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    );

    const handleExportar = () => {
        // Lógica para exportar datos
        console.log("Exportando datos de departamentos...");
    };

    if (rolSesion !== "admin") return <Navigate to="/dashboard" replace />;

    // Colores por departamento
    const departmentColors = {
        'RRHH': '#8B5CF6',
        'Recepción': '#2EC4B6',
        'Restaurante': '#FF9F1C',
        'Limpieza': '#10B981',
        'Mantenimiento': '#EF4444',
        'Administración': '#717182'
    };

    const getColor = (nombre) => departmentColors[nombre] || '#3B82F6';

    return (
        <div className="dashboard-wrapper">
            <Sidebar />
            <div className="main-content">
                <Topbar />

                <div className="content-padding">
                    {/* Header principal */}
                    <div className="page-header">
                        <div className="header-content">
                            <div className="header-text">
                                <h1>Gestión de Departamentos</h1>
                                <p>Administra y organiza los departamentos del hotel</p>
                            </div>
                            <div className="header-actions">
                                <button
                                    className="btn-export"
                                    onClick={handleExportar}
                                >
                                    <Download size={18} />
                                    Exportar
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={abrirModalCrear}
                                >
                                    <Plus size={18} />
                                    Nuevo Departamento
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tarjetas de estadísticas */}
                    <div className="stats-container">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <Building2 size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>{estadisticas.total}</h3>
                                <p>Total Departamentos</p>
                            </div>
                            <div className="stat-trend">
                                <TrendingUp size={16} />
                                <span>100% Activos</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <Users size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>{estadisticas.empleadosTotales}</h3>
                                <p>Empleados Totales</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <CheckCircle size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>{estadisticas.activos}</h3>
                                <p>Departamentos Activos</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <Calendar size={24} />
                            </div>
                            <div className="stat-info">
                                <h3>{estadisticas.nuevosEsteMes}</h3>
                                <p>Nuevos este mes</p>
                            </div>
                        </div>
                    </div>

                    {/* Barra de filtros y búsqueda */}
                    <div className="filters-container">
                        <div className="search-wrapper">
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o descripción..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="filters-wrapper">
                            <div className="filter-group">
                                <span className="filter-label">
                                    <Filter size={16} />
                                    Filtros
                                </span>
                                <select className="filter-select">
                                    <option value="">Todos los departamentos</option>
                                    {departamentos.map(depto => (
                                        <option key={depto.id} value={depto.id}>
                                            {depto.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="results-info">
                                Mostrando {filteredDepartamentos.length} de {departamentos.length} departamentos
                            </div>
                        </div>
                    </div>

                    {/* Tabla de departamentos */}
                    <div className="table-container">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Cargando departamentos...</p>
                            </div>
                        ) : filteredDepartamentos.length === 0 ? (
                            <div className="empty-state">
                                <Building2 size={48} />
                                <h3>No se encontraron departamentos</h3>
                                <p>No hay departamentos que coincidan con tu búsqueda.</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Departamento</th>
                                        <th>Descripción</th>
                                        <th>Empleados</th>
                                        <th>Estado</th>
                                        <th>Fecha de Creación</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDepartamentos.map(depto => (
                                        <tr key={depto.id}>
                                            <td>
                                                <div className="dept-info">
                                                    <div
                                                        className="dept-color"
                                                        style={{ backgroundColor: getColor(depto.nombre) }}
                                                    ></div>
                                                    <div>
                                                        <div className="dept-name">{depto.nombre}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="dept-description">
                                                    {depto.descripcion || "Sin descripción"}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="employee-count">
                                                    <Users size={16} />
                                                    <span>{depto.total_empleados || 0}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${depto.activo ? 'active' : 'inactive'}`}>
                                                    {depto.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="date-cell">
                                                    <Calendar size={14} />
                                                    {new Date(depto.created_at).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-action edit"
                                                        onClick={() => abrirModalEditar(depto)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button className="btn-action view">
                                                        Ver Detalles
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para crear/editar */}
            {mostrarModal && (
                <DepartamentoModal
                    isOpen={mostrarModal}
                    onClose={cerrarModal}
                    departamento={departamentoEditando}
                    refreshData={fetchDepartamentos}
                    mode={departamentoEditando ? 'edit' : 'create'}
                />
            )}
        </div>
    );
}