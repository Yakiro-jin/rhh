import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import EmpleadoModal from "../components/EmpleadoModal";
import { getSession } from "../services/api";
import {
    UserPlus, Search, Edit2, Trash2, Eye, UserCheck, UserX,
    Filter, Download, MoreVertical, ChevronDown, Users, Building,
    Calendar, Phone, Mail, Award, TrendingUp, RefreshCw, CheckCircle,
    XCircle, Activity, Star
} from "lucide-react";
import "../styles/Empleados.css";

export default function EmpleadosPage() {
    const [empleados, setEmpleados] = useState([]);
    const [filteredEmpleados, setFilteredEmpleados] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, activos: 0, nuevos: 0 });
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [departments, setDepartments] = useState([]);

    // Estados para el Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'

    const session = getSession();

    // Colores para departamentos (puedes personalizar)
    const departmentColors = {
        'Recepción': '#2EC4B6',
        'Restaurante': '#FF9F1C',
        'Limpieza': '#10B981',
        'Mantenimiento': '#EF4444',
        'RRHH': '#8B5CF6',
        'Administración': '#717182',
        'Alimentos y Bebidas': '#F59E0B',
        'Seguridad': '#3B82F6',
        'Eventos': '#EC4899'
    };

    const fetchEmpleados = async () => {
        setLoading(true);
        try {
            const [empleadosRes, departamentosRes] = await Promise.all([
                api.get("/empleados"),
                api.get("/departamentos")
            ]);

            setEmpleados(empleadosRes.data);
            setDepartments(departamentosRes.data);

            // Filtrar por defecto todos
            filterEmpleados(empleadosRes.data, 'all', 'all', '');

            // Calcular estadísticas
            const total = empleadosRes.data.length;
            const activos = empleadosRes.data.filter(e => e.estatus === 'activo').length;
            const nuevos = empleadosRes.data.filter(e => {
                if (!e.fecha_ingreso) return false;
                const ingreso = new Date(e.fecha_ingreso);
                const hoy = new Date();
                const diffTime = hoy - ingreso;
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                return diffDays <= 30; // Últimos 30 días
            }).length;

            setStats({ total, activos, nuevos });
            setLoading(false);
        } catch (err) {
            console.error("Error al obtener empleados:", err);
            setLoading(false);
        }
    };

    // Función de filtrado
    const filterEmpleados = (data, filter, department, search) => {
        let filtered = [...data];

        // Filtro por estatus
        if (filter !== 'all') {
            filtered = filtered.filter(e => e.estatus === filter);
        }

        // Filtro por departamento
        if (department !== 'all') {
            filtered = filtered.filter(e =>
                e.departamento_nombre === department ||
                e.departamento_id?.toString() === department
            );
        }

        // Filtro por búsqueda
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(e =>
                e.nombre?.toLowerCase().includes(searchLower) ||
                e.apellido?.toLowerCase().includes(searchLower) ||
                e.correo?.toLowerCase().includes(searchLower) ||
                e.cargo?.toLowerCase().includes(searchLower) ||
                e.departamento_nombre?.toLowerCase().includes(searchLower) ||
                e.cedula?.toString().includes(searchLower)
            );
        }

        setFilteredEmpleados(filtered);
    };

    useEffect(() => {
        filterEmpleados(empleados, activeFilter, selectedDepartment, searchTerm);
    }, [empleados, activeFilter, selectedDepartment, searchTerm]);

    useEffect(() => {
        fetchEmpleados();
    }, []);

    // Si por algún error de ruta alguien entra, esto lo saca
    if (session?.rol !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    const handleEdit = (emp) => {
        setSelectedEmpleado(emp);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedEmpleado(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const toggleEstatus = async (id, estatusActual) => {
        const nuevoEstatus = estatusActual === 'activo' ? 'inactivo' : 'activo';
        const confirmMessage = nuevoEstatus === 'inactivo'
            ? '¿Estás seguro de desactivar este empleado?'
            : '¿Deseas reactivar este empleado?';

        if (window.confirm(confirmMessage)) {
            try {
                await api.put(`/empleados/${id}/estatus`, { estatus: nuevoEstatus });
                fetchEmpleados(); // Refrescar lista
            } catch (err) {
                console.error("Error al actualizar estatus:", err);
                alert("Error al actualizar el estatus del empleado");
            }
        }
    };

    const handleExport = () => {
        // Lógica para exportar a Excel/PDF
        alert("Función de exportación en desarrollo");
    };

    const handleViewDetails = (emp) => {
        // Navegar a vista detallada o mostrar modal
        alert(`Ver detalles de ${emp.nombre} ${emp.apellido}`);
    };

    const getDepartmentColor = (deptName) => {
        return departmentColors[deptName] || '#717182';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No definida';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="dashboard-wrapper">
            <Sidebar />
            <div className="main-content">
                <Topbar />

                <div className="empleados-container">
                    {/* Header del Módulo */}
                    <div className="empleados-header">
                        <div className="header-content">
                            <div className="header-title">
                                <h1>Gestión de Personal</h1>
                                <div className="header-badge">
                                    <Users size={16} />
                                    <span>{stats.total} empleados</span>
                                </div>
                            </div>
                            <p className="header-subtitle">
                                Administra y supervisa toda la información del personal del hotel
                            </p>
                        </div>

                        <div className="header-actions">
                            <button className="btn-refresh" onClick={fetchEmpleados} title="Actualizar lista">
                                <RefreshCw size={20} />
                            </button>
                            <button className="btn-export" onClick={handleExport}>
                                <Download size={20} />
                                <span>Exportar</span>
                            </button>
                            <button className="btn-primary" onClick={handleCreate}>
                                <UserPlus size={20} />
                                <span>Nuevo Empleado</span>
                            </button>
                        </div>
                    </div>

                    {/* Estadísticas Rápidas */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(46, 196, 182, 0.1)', color: '#2EC4B6' }}>
                                <Users size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.total}</h3>
                                <p>Total Personal</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                                <CheckCircle size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.activos}</h3>
                                <p>Empleados Activos</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(255, 159, 28, 0.1)', color: '#FF9F1C' }}>
                                <Activity size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.nuevos}</h3>
                                <p>Nuevos este mes</p>
                            </div>
                        </div>
                    </div>

                    {/* Barra de Herramientas */}
                    <div className="tools-bar">
                        <div className="search-box">
                            <Search size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, cargo, departamento..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="filters">
                            <div className="filter-group">
                                <Filter size={18} />
                                <select
                                    value={activeFilter}
                                    onChange={(e) => setActiveFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="activo">Activos</option>
                                    <option value="inactivo">Inactivos</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <Building size={18} />
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">Todos los departamentos</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.nombre}>
                                            {dept.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Empleados */}
                    <div className="empleados-list-container">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Cargando información del personal...</p>
                            </div>
                        ) : filteredEmpleados.length > 0 ? (
                            <div className="empleados-grid">
                                {filteredEmpleados.map(emp => {
                                    const deptColor = getDepartmentColor(emp.departamento_nombre);

                                    return (
                                        <div key={emp.id} className={`empleado-card ${emp.estatus === 'inactivo' ? 'inactive' : ''}`}>
                                            {/* Header de la Tarjeta */}
                                            <div className="card-header">
                                                <div className="employee-avatar">
                                                    <div
                                                        className="avatar-circle"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${deptColor} 0%, ${deptColor}99 100%)`,
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {emp.nombre?.charAt(0)}{emp.apellido?.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="employee-info">
                                                    <h3>{emp.nombre} {emp.apellido}</h3>
                                                    <p className="employee-position">{emp.cargo}</p>
                                                </div>
                                                <div className="card-actions">
                                                    <button
                                                        className={`status-badge ${emp.estatus}`}
                                                        onClick={() => toggleEstatus(emp.id, emp.estatus)}
                                                        title={emp.estatus === 'activo' ? 'Desactivar empleado' : 'Activar empleado'}
                                                    >
                                                        {emp.estatus === 'activo' ? 'Activo' : 'Inactivo'}
                                                    </button>
                                                    <button className="more-options">
                                                        <MoreVertical size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Información Detallada */}
                                            <div className="card-body">
                                                <div className="info-row">
                                                    <div className="info-item">
                                                        <Mail size={16} />
                                                        <span>{emp.correo}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <Phone size={16} />
                                                        <span>{emp.telefono || 'No registrado'}</span>
                                                    </div>
                                                </div>

                                                <div className="info-row">
                                                    <div className="info-item">
                                                        <Building size={16} />
                                                        <span style={{ color: deptColor }}>{emp.departamento_nombre}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <Calendar size={16} />
                                                        <span>{formatDate(emp.fecha_ingreso)}</span>
                                                    </div>
                                                </div>

                                                {emp.evaluacion_promedio && (
                                                    <div className="rating-section">
                                                        <div className="rating-label">
                                                            <Star size={14} />
                                                            <span>Evaluación</span>
                                                        </div>
                                                        <div className="rating-bar">
                                                            <div
                                                                className="rating-fill"
                                                                style={{ width: `${(emp.evaluacion_promedio / 10) * 100}%` }}
                                                            />
                                                            <span className="rating-value">{emp.evaluacion_promedio.toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Acciones */}
                                            <div className="card-footer">
                                                <div className="action-buttons">
                                                    <button
                                                        className="action-btn view"
                                                        onClick={() => handleViewDetails(emp)}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye size={18} />
                                                        <span>Detalles</span>
                                                    </button>
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => handleEdit(emp)}
                                                        title="Editar"
                                                    >
                                                        <Edit2 size={18} />
                                                        <span>Editar</span>
                                                    </button>
                                                    <button
                                                        className={`action-btn ${emp.estatus === 'activo' ? 'deactivate' : 'activate'}`}
                                                        onClick={() => toggleEstatus(emp.id, emp.estatus)}
                                                        title={emp.estatus === 'activo' ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {emp.estatus === 'activo' ? (
                                                            <>
                                                                <UserX size={18} />
                                                                <span>Desactivar</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck size={18} />
                                                                <span>Activar</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <Users size={48} />
                                </div>
                                <h3>No se encontraron empleados</h3>
                                <p>No hay empleados que coincidan con los filtros aplicados.</p>
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        setActiveFilter('all');
                                        setSelectedDepartment('all');
                                        setSearchTerm('');
                                    }}
                                >
                                    Ver todos los empleados
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer de la Lista */}
                    {filteredEmpleados.length > 0 && (
                        <div className="list-footer">
                            <div className="pagination-info">
                                Mostrando {filteredEmpleados.length} de {empleados.length} empleados
                            </div>
                            <div className="pagination-controls">
                                <button className="pagination-btn" disabled>← Anterior</button>
                                <span className="pagination-current">1</span>
                                <button className="pagination-btn">Siguiente →</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Registro/Edición */}
            <EmpleadoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                refreshData={fetchEmpleados}
                empleadoParaEditar={selectedEmpleado}
                mode={modalMode}
            />
        </div>
    );
}