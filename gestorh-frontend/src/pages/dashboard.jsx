import { useEffect, useState } from "react";
import api, { getSession } from "../services/api";
import Sidebar from "../components/sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import {
    Users, ClipboardCheck, GraduationCap, AlertTriangle,
    TrendingUp, Calendar, Target, BarChart3,
    TrendingDown, Award, Clock, Percent, ChevronRight,
    CheckCircle, XCircle, UserCheck, FileText
} from "lucide-react";
import "../styles/dashboard.css";

// Componente de tarjeta de métrica mejorado
const StatCard = ({ title, value, icon: Icon, color, trend, subtitle, loading }) => {
    const colorVars = {
        turquesa: '#2EC4B6',
        naranja: '#FF9F1C',
        mint: '#CBF3F0',
        error: '#EF4444',
        success: '#10B981'
    };

    const bgColor = colorVars[color] || color;

    return (
        <div className={`stat-card ${loading ? 'loading' : ''}`}>
            <div className="stat-icon-wrapper" style={{ background: `${bgColor}15` }}>
                <Icon size={20} style={{ color: bgColor }} />
            </div>
            <div className="stat-content">
                <p className="stat-title">{title}</p>
                <h2 className="stat-value">{loading ? "..." : value}</h2>
                {subtitle && <p className="stat-subtitle">{subtitle}</p>}
                {trend && (
                    <div className="stat-trend">
                        <span className={`trend-indicator ${trend.direction}`}>
                            {trend.direction === 'up' ? '↗' : '↘'}
                        </span>
                        <span className="trend-value">{trend.value}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Componente de módulo con diseño mejorado
const ModuleCard = ({ title, icon: Icon, subtitle, children, color = '#2EC4B6' }) => (
    <div className="module-card">
        <div className="module-header">
            <div className="module-icon" style={{ background: `${color}15`, color: color }}>
                <Icon size={20} />
            </div>
            <div className="module-title-container">
                <h3>{title}</h3>
                <p>{subtitle}</p>
            </div>
            <ChevronRight size={18} className="module-arrow" />
        </div>
        <div className="module-content">
            {children}
        </div>
    </div>
);

// Componente de gráfico de barras mejorado
const ProgressBar = ({ label, value, color, max = 100 }) => (
    <div className="progress-bar-container">
        <div className="progress-bar-header">
            <span className="progress-label">{label}</span>
            <span className="progress-value">{value}%</span>
        </div>
        <div className="progress-bar-bg">
            <div
                className="progress-bar-fill"
                style={{
                    width: `${(value / max) * 100}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}DD)`
                }}
            />
        </div>
    </div>
);

// Componente de lista de elementos
const ItemList = ({ items, color = '#2EC4B6' }) => (
    <div className="item-list">
        {items.map((item, index) => (
            <div key={index} className="list-item">
                <div className="item-badge" style={{ background: `${color}15`, color: color }}>
                    {item.icon || index + 1}
                </div>
                <div className="item-content">
                    <p className="item-title">{item.title}</p>
                    <span className="item-subtitle">{item.subtitle}</span>
                </div>
                <div className="item-value">{item.value}</div>
            </div>
        ))}
    </div>
);

export default function Dashboard() {
    const { rol, nombre } = getSession() || {};
    const [loading, setLoading] = useState(true);

    // Datos simulados mejor estructurados
    const adminData = {
        metrics: {
            promedioGeneral: { value: 8.5, trend: { direction: 'up', value: '+0.3' } },
            amonestacionesMes: { value: 14, trend: { direction: 'down', value: '-3' } },
            tasaFinalizacion: { value: '78%' },
            personalActivo: { value: 142 }
        },
        rankingDepartamentos: [
            { label: 'Ama de Llaves', value: 92, color: '#2EC4B6' },
            { label: 'Recepción', value: 88, color: '#FF9F1C' },
            { label: 'Restaurante', value: 81, color: '#10B981' },
            { label: 'Limpieza', value: 79, color: '#717182' },
            { label: 'Mantenimiento', value: 75, color: '#EF4444' }
        ],
        tiposIncidencias: [
            { label: 'Puntualidad', value: 45, color: '#FF9F1C' },
            { label: 'Uniforme', value: 30, color: '#2EC4B6' },
            { label: 'Trato al Cliente', value: 15, color: '#EF4444' },
            { label: 'Otros', value: 10, color: '#717182' }
        ]
    };

    const supervisorData = {
        metrics: {
            miEquipo: { value: 8 },
            evaluacionesPendientes: { value: 3 },
            satisfaccionCliente: { value: 8.9 },
            ausenciasMes: { value: 4 }
        },
        progresoIndividual: [
            { title: 'Ana López', subtitle: 'Última evaluación', value: '+0.7' },
            { title: 'Carlos Ruiz', subtitle: 'Última evaluación', value: '-0.3' },
            { title: 'María Santos', subtitle: 'Última evaluación', value: '+0.8' }
        ],
        alertasDesempenio: [
            { title: 'Juan Pérez', subtitle: 'Nota: 6.5', value: 'Bajo rendimiento' },
            { title: 'Laura Méndez', subtitle: 'Nota: 7.0', value: 'Atención' }
        ]
    };

    const data = rol === 'admin' ? adminData : supervisorData;

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="dashboard-wrapper">
            <Sidebar />
            <div className="main-content">
                <Topbar nombre={nombre} />

                <div className="dashboard-container">
                    {/* Header Mejorado */}
                    <div className="dashboard-header">
                        <div className="header-content">
                            <h1>Buen día, {nombre?.split(' ')[0] || "Usuario"}! <span className="welcome-emoji">👋</span></h1>
                            <p className="header-subtitle">
                                {rol === 'admin'
                                    ? "Aquí tienes el resumen completo del desempeño del hotel"
                                    : "Sigue el progreso de tu equipo y las tareas pendientes"}
                            </p>
                        </div>
                        <div className="header-date">
                            <Calendar size={16} />
                            <span>
                                {new Date().toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'short'
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Grid de Métricas Mejorado */}
                    <div className="metrics-grid">
                        {rol === 'admin' ? (
                            <>
                                <StatCard
                                    title="Promedio General"
                                    value={data.metrics.promedioGeneral.value.toFixed(1)}
                                    icon={Target}
                                    color="turquesa"
                                    trend={data.metrics.promedioGeneral.trend}
                                    subtitle="Rendimiento hotel"
                                    loading={loading}
                                />
                                <StatCard
                                    title="Amonestaciones"
                                    value={data.metrics.amonestacionesMes.value}
                                    icon={AlertTriangle}
                                    color="error"
                                    trend={data.metrics.amonestacionesMes.trend}
                                    subtitle="Este mes"
                                    loading={loading}
                                />
                                <StatCard
                                    title="Finalización Cursos"
                                    value={data.metrics.tasaFinalizacion.value}
                                    icon={GraduationCap}
                                    color="success"
                                    subtitle="Tasa de éxito"
                                    loading={loading}
                                />
                                <StatCard
                                    title="Personal Activo"
                                    value={data.metrics.personalActivo.value}
                                    icon={Users}
                                    color="naranja"
                                    subtitle="Total hotel"
                                    loading={loading}
                                />
                            </>
                        ) : (
                            <>
                                <StatCard
                                    title="Mi Equipo"
                                    value={data.metrics.miEquipo.value}
                                    icon={Users}
                                    color="turquesa"
                                    subtitle="Miembros activos"
                                    loading={loading}
                                />
                                <StatCard
                                    title="Pendientes"
                                    value={data.metrics.evaluacionesPendientes.value}
                                    icon={ClipboardCheck}
                                    color="naranja"
                                    subtitle="Evaluaciones"
                                    loading={loading}
                                />
                                <StatCard
                                    title="Satisfacción"
                                    value={data.metrics.satisfaccionCliente.value.toFixed(1)}
                                    icon={Award}
                                    color="success"
                                    subtitle="Cliente"
                                    loading={loading}
                                />
                                <StatCard
                                    title="Ausencias"
                                    value={data.metrics.ausenciasMes.value}
                                    icon={Clock}
                                    color="error"
                                    subtitle="Este mes"
                                    loading={loading}
                                />
                            </>
                        )}
                    </div>

                    {/* Módulos Organizados */}
                    <div className="modules-grid">
                        {/* Módulo 1: Gestión de Desempeño */}
                        <ModuleCard
                            title="Gestión de Desempeño"
                            icon={Target}
                            subtitle={rol === 'admin' ? "Calidad del trabajo en todo el hotel" : "Seguimiento individual del equipo"}
                            color="#2EC4B6"
                        >
                            {rol === 'admin' ? (
                                <>
                                    <div className="module-section">
                                        <h4>Ranking de Departamentos</h4>
                                        <div className="ranking-list">
                                            {data.rankingDepartamentos.map((depto, index) => (
                                                <ProgressBar
                                                    key={index}
                                                    label={depto.label}
                                                    value={depto.value}
                                                    color={depto.color}
                                                    max={100}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="module-stats">
                                        <div className="stat-mini">
                                            <span className="stat-label">Mejor área</span>
                                            <span className="stat-number" style={{ color: '#2EC4B6' }}>9.2</span>
                                        </div>
                                        <div className="stat-mini">
                                            <span className="stat-label">Necesita atención</span>
                                            <span className="stat-number" style={{ color: '#EF4444' }}>7.5</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="module-section">
                                        <h4>Progreso Individual</h4>
                                        <ItemList
                                            items={data.progresoIndividual}
                                            color="#2EC4B6"
                                        />
                                    </div>
                                    <div className="module-section">
                                        <h4>Alertas de Desempeño</h4>
                                        <div className="alerts-container">
                                            {data.alertasDesempenio.map((alerta, index) => (
                                                <div key={index} className="alert-mini">
                                                    <div className="alert-dot" style={{ background: '#EF4444' }} />
                                                    <div className="alert-text">
                                                        <p>{alerta.title}</p>
                                                        <span>{alerta.subtitle}</span>
                                                    </div>
                                                    <span className="alert-tag">{alerta.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </ModuleCard>

                        {/* Módulo 2: Formación y Desarrollo */}
                        <ModuleCard
                            title="Formación y Desarrollo"
                            icon={GraduationCap}
                            subtitle={rol === 'admin' ? "Crecimiento profesional del personal" : "Capacitaciones del equipo"}
                            color="#FF9F1C"
                        >
                            <div className="module-section">
                                <h4>Impacto de la Formación</h4>
                                <div className="impact-grid">
                                    <div className="impact-card">
                                        <div className="impact-icon" style={{ background: '#10B98115', color: '#10B981' }}>
                                            <TrendingUp size={16} />
                                        </div>
                                        <div className="impact-content">
                                            <p className="impact-value">+12%</p>
                                            <span className="impact-label">Mejora post-curso</span>
                                        </div>
                                    </div>
                                    <div className="impact-card">
                                        <div className="impact-icon" style={{ background: '#2EC4B615', color: '#2EC4B6' }}>
                                            <Award size={16} />
                                        </div>
                                        <div className="impact-content">
                                            <p className="impact-value">+15%</p>
                                            <span className="impact-label">Servicio al Cliente</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="module-section">
                                <h4>{rol === 'admin' ? 'Cursos más efectivos' : 'Próximas capacitaciones'}</h4>
                                <div className="courses-list">
                                    <div className="course-item">
                                        <div className="course-dot" style={{ background: '#2EC4B6' }} />
                                        <div className="course-info">
                                            <p>Técnicas de Limpieza</p>
                                            <span>{rol === 'admin' ? '+8% impacto' : '25 Ene - 10:00 AM'}</span>
                                        </div>
                                    </div>
                                    <div className="course-item">
                                        <div className="course-dot" style={{ background: '#FF9F1C' }} />
                                        <div className="course-info">
                                            <p>Protocolos de Seguridad</p>
                                            <span>{rol === 'admin' ? '+10% impacto' : '28 Ene - 09:00 AM'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ModuleCard>

                        {/* Módulo 3: Gestión del Comportamiento */}
                        <ModuleCard
                            title="Gestión del Comportamiento"
                            icon={AlertTriangle}
                            subtitle={rol === 'admin' ? "Control disciplinario hotel" : "Seguimiento disciplinario"}
                            color="#EF4444"
                        >
                            {rol === 'admin' ? (
                                <>
                                    <div className="module-section">
                                        <h4>Tipos de Incidencias</h4>
                                        <div className="incidents-chart">
                                            {data.tiposIncidencias.map((incidencia, index) => (
                                                <div key={index} className="incident-row">
                                                    <div className="incident-label">
                                                        <div
                                                            className="incident-color"
                                                            style={{ background: incidencia.color }}
                                                        />
                                                        <span>{incidencia.label}</span>
                                                    </div>
                                                    <div className="incident-bar">
                                                        <div
                                                            className="bar-fill"
                                                            style={{
                                                                width: `${incidencia.value}%`,
                                                                background: incidencia.color
                                                            }}
                                                        />
                                                        <span className="bar-value">{incidencia.value}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="module-section">
                                        <h4>Alertas de Reincidencia</h4>
                                        <div className="recurrence-alerts">
                                            <div className="alert-high">
                                                <div className="alert-header">
                                                    <UserCheck size={16} />
                                                    <span>Miguel Torres</span>
                                                </div>
                                                <div className="alert-details">
                                                    <span className="alert-count">3 amonestaciones</span>
                                                    <span className="alert-risk">Riesgo Alto</span>
                                                </div>
                                            </div>
                                            <div className="alert-medium">
                                                <div className="alert-header">
                                                    <UserCheck size={16} />
                                                    <span>Elena Vargas</span>
                                                </div>
                                                <div className="alert-details">
                                                    <span className="alert-count">2 amonestaciones</span>
                                                    <span className="alert-risk">Riesgo Medio</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </ModuleCard>

                        {/* Módulo 4: Gestión de Empleados (Solo Admin) */}
                        {rol === 'admin' && (
                            <ModuleCard
                                title="Gestión de Empleados"
                                icon={Users}
                                subtitle="Datos demográficos y control de ausencias"
                                color="#717182"
                            >
                                <div className="module-section">
                                    <h4>Distribución Demográfica</h4>
                                    <div className="demographic-stats">
                                        <div className="demo-stat">
                                            <div className="demo-icon" style={{ background: '#2EC4B615', color: '#2EC4B6' }}>
                                                <Users size={16} />
                                            </div>
                                            <div className="demo-content">
                                                <p className="demo-value">58% / 42%</p>
                                                <span className="demo-label">Hombres / Mujeres</span>
                                            </div>
                                        </div>
                                        <div className="demo-stat">
                                            <div className="demo-icon" style={{ background: '#FF9F1C15', color: '#FF9F1C' }}>
                                                <Calendar size={16} />
                                            </div>
                                            <div className="demo-content">
                                                <p className="demo-value">55 días</p>
                                                <span className="demo-label">Ausencias totales</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="module-section">
                                    <h4>Ausencias por Departamento</h4>
                                    <div className="absence-list">
                                        <div className="absence-item">
                                            <span>Limpieza</span>
                                            <div className="absence-bar">
                                                <div className="bar-fill" style={{ width: '100%', background: '#EF4444' }} />
                                            </div>
                                            <span className="absence-value">20 días</span>
                                        </div>
                                        <div className="absence-item">
                                            <span>Restaurante</span>
                                            <div className="absence-bar">
                                                <div className="bar-fill" style={{ width: '75%', background: '#FF9F1C' }} />
                                            </div>
                                            <span className="absence-value">15 días</span>
                                        </div>
                                    </div>
                                </div>
                            </ModuleCard>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}