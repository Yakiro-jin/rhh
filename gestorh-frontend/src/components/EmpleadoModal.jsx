import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
    X, User, Mail, Phone, MapPin, Briefcase,
    Calendar, Hash, Building, Users, Save, Loader, ChevronDown
} from "lucide-react";
import "../styles/EmpleadoModal.css";

export default function EmpleadoModal({
    isOpen,
    onClose,
    refreshData,
    empleadoParaEditar,
    mode = 'create'
}) {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        cedula: "",
        email_personal: "",
        telefono: "",
        cargo_id: "", // Cambiado de cargo_nombre a cargo_id
        departamento_id: "",
        fecha_ingreso: "",
        fecha_nacimiento: "",
        direccion: "",
        activo: true,
    });

    const [departamentos, setDepartamentos] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [cargosFiltrados, setCargosFiltrados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Colores para departamentos
    const departmentColors = {
        'Recepción': '#2EC4B6',
        'Restaurante': '#FF9F1C',
        'Limpieza': '#10B981',
        'Mantenimiento': '#EF4444',
        'RRHH': '#8B5CF6',
        'Administración': '#717182'
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        return d.toISOString().split("T")[0];
    };

    // Cargar datos iniciales
    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                // Cargar departamentos
                const resDepartamentos = await api.get("/departamentos");
                setDepartamentos(resDepartamentos.data);

                // Cargar todos los cargos
                const resCargos = await api.get("/cargos");
                setCargos(resCargos.data);

                if (mode === 'edit' && empleadoParaEditar) {
                    // Primero establecer los datos básicos
                    const datosIniciales = {
                        ...empleadoParaEditar,
                        departamento_id: empleadoParaEditar.departamento_id || "",
                        cargo_id: empleadoParaEditar.cargo_id || "",
                        fecha_ingreso: formatDate(empleadoParaEditar.fecha_ingreso),
                        fecha_nacimiento: formatDate(empleadoParaEditar.fecha_nacimiento),
                        activo: empleadoParaEditar.estatus === 'activo'
                    };

                    setFormData(datosIniciales);

                    // Si hay departamento seleccionado, filtrar cargos
                    if (empleadoParaEditar.departamento_id) {
                        const filtrados = resCargos.data.filter(
                            cargo => cargo.departamento_id?.toString() === empleadoParaEditar.departamento_id?.toString()
                        );
                        setCargosFiltrados(filtrados);
                    }
                } else {
                    // Limpiar formulario si es modo crear
                    setFormData({
                        nombre: "",
                        apellido: "",
                        cedula: "",
                        email_personal: "",
                        telefono: "",
                        cargo_id: "",
                        departamento_id: "",
                        fecha_ingreso: "",
                        fecha_nacimiento: "",
                        direccion: "",
                        activo: true,
                    });
                    setCargosFiltrados([]);
                }
            } catch (err) {
                console.error("Error cargando datos:", err);
                setError("No se pudieron cargar los datos necesarios");
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            cargarDatos();
        }
    }, [isOpen, mode, empleadoParaEditar]);

    // Filtrar cargos cuando cambia el departamento
    useEffect(() => {
        if (formData.departamento_id) {
            const filtrados = cargos.filter(
                cargo => cargo.departamento_id?.toString() === formData.departamento_id?.toString()
            );
            setCargosFiltrados(filtrados);

            // Si el cargo actual no pertenece al departamento seleccionado, limpiarlo
            const cargoActual = cargos.find(c => c.id?.toString() === formData.cargo_id?.toString());
            if (cargoActual && cargoActual.departamento_id?.toString() !== formData.departamento_id?.toString()) {
                setFormData(prev => ({ ...prev, cargo_id: "" }));
            }
        } else {
            setCargosFiltrados([]);
            setFormData(prev => ({ ...prev, cargo_id: "" }));
        }
    }, [formData.departamento_id, cargos]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            // Validar que se haya seleccionado un cargo
            if (!formData.cargo_id) {
                throw new Error("Por favor selecciona un cargo");
            }

            // Preparar payload con los nombres de campo esperados por el backend
            const payload = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                cedula: formData.cedula,
                email_personal: formData.email_personal,
                telefono: formData.telefono || null,
                fecha_ingreso: formData.fecha_ingreso,
                cargo_id: formData.cargo_id,
                departamento_id: formData.departamento_id,
                estatus: formData.activo ? 'activo' : 'inactivo'
            };

            // Agregar campos opcionales si existen
            if (formData.fecha_nacimiento) {
                payload.fecha_nacimiento = formData.fecha_nacimiento;
            }
            if (formData.direccion) {
                payload.direccion = formData.direccion;
            }

            if (mode === 'create') {
                await api.post("/empleados", payload);
            } else {
                await api.put(`/empleados/${empleadoParaEditar.id}`, payload);
            }

            refreshData();
            onClose();
        } catch (err) {
            console.error("Error guardando empleado:", err);
            setError(err.response?.data?.error || err.message || "No se pudo guardar el empleado");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose} />
            <div className="modal-container">
                <div className="modal-content">
                    {/* Header del Modal */}
                    <div className="modal-header">
                        <div className="modal-title">
                            <div className="modal-icon">
                                <User size={24} />
                            </div>
                            <div>
                                <h2>{mode === 'create' ? 'Registrar Nuevo Empleado' : 'Editar Empleado'}</h2>
                                <p>{mode === 'create' ? 'Completa todos los campos requeridos' : 'Modifica la información del empleado'}</p>
                            </div>
                        </div>
                        <button className="modal-close" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="modal-form">
                        {error && (
                            <div className="form-error">
                                {error}
                            </div>
                        )}

                        <div className="form-section">
                            <h3>
                                <User size={18} />
                                Información Personal
                            </h3>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label htmlFor="nombre">
                                        <span className="required">*</span> Nombre
                                    </label>
                                    <input
                                        id="nombre"
                                        name="nombre"
                                        placeholder="Ej: Ana"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                        className="styled-input"
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="apellido">
                                        <span className="required">*</span> Apellido
                                    </label>
                                    <input
                                        id="apellido"
                                        name="apellido"
                                        placeholder="Ej: López"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        required
                                        className="styled-input"
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="cedula">
                                        <span className="required">*</span> Cédula
                                    </label>
                                    <div className="input-with-icon">
                                        <Hash size={18} />
                                        <input
                                            id="cedula"
                                            name="cedula"
                                            placeholder="Ej: 12345678"
                                            value={formData.cedula}
                                            onChange={handleChange}
                                            required
                                            className="styled-input"
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="email_personal">
                                        <span className="required">*</span> Correo
                                    </label>
                                    <div className="input-with-icon">
                                        <Mail size={18} />
                                        <input
                                            type="email"
                                            id="email_personal"
                                            name="email_personal"
                                            placeholder="ejemplo@empresa.com"
                                            value={formData.email_personal}
                                            onChange={handleChange}
                                            required
                                            className="styled-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>
                                <Briefcase size={18} />
                                Información Laboral
                            </h3>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label htmlFor="departamento_id">
                                        <span className="required">*</span> Departamento
                                    </label>
                                    <div className="input-with-icon select-container">
                                        <Building size={18} />
                                        <select
                                            id="departamento_id"
                                            name="departamento_id"
                                            value={formData.departamento_id}
                                            onChange={handleChange}
                                            required
                                            className="styled-select"
                                        >
                                            <option value="">Seleccionar departamento</option>
                                            {departamentos.map((d) => (
                                                <option
                                                    key={d.id}
                                                    value={d.id}
                                                    style={{
                                                        color: departmentColors[d.nombre] || '#717182',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {d.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="select-arrow" />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="cargo_id">
                                        <span className="required">*</span> Cargo
                                    </label>
                                    <div className="input-with-icon select-container">
                                        <Briefcase size={18} />
                                        <select
                                            id="cargo_id"
                                            name="cargo_id"
                                            value={formData.cargo_id}
                                            onChange={handleChange}
                                            required
                                            disabled={!formData.departamento_id || cargosFiltrados.length === 0}
                                            className="styled-select"
                                        >
                                            <option value="">
                                                {!formData.departamento_id
                                                    ? "Primero selecciona un departamento"
                                                    : cargosFiltrados.length === 0
                                                        ? "No hay cargos para este departamento"
                                                        : "Seleccionar cargo"}
                                            </option>
                                            {cargosFiltrados.map((cargo) => (
                                                <option key={cargo.id} value={cargo.id}>
                                                    {cargo.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="select-arrow" />
                                    </div>
                                    {formData.departamento_id && cargosFiltrados.length === 0 && (
                                        <p className="input-hint">
                                            Este departamento no tiene cargos registrados.
                                        </p>
                                    )}
                                </div>

                                <div className="input-group">
                                    <label htmlFor="fecha_ingreso">
                                        <span className="required">*</span> Fecha de Ingreso
                                    </label>
                                    <div className="input-with-icon">
                                        <Calendar size={18} />
                                        <input
                                            type="date"
                                            id="fecha_ingreso"
                                            name="fecha_ingreso"
                                            value={formData.fecha_ingreso || ""}
                                            onChange={handleChange}
                                            required
                                            className="styled-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>
                                <MapPin size={18} />
                                Información Adicional
                            </h3>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label htmlFor="telefono">Teléfono</label>
                                    <div className="input-with-icon">
                                        <Phone size={18} />
                                        <input
                                            id="telefono"
                                            name="telefono"
                                            placeholder="Ej: 555-0101"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            className="styled-input"
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                                    <div className="input-with-icon">
                                        <Calendar size={18} />
                                        <input
                                            type="date"
                                            id="fecha_nacimiento"
                                            name="fecha_nacimiento"
                                            value={formData.fecha_nacimiento || ""}
                                            onChange={handleChange}
                                            className="styled-input"
                                        />
                                    </div>
                                </div>

                                <div className="input-group full-width">
                                    <label htmlFor="direccion">Dirección</label>
                                    <div className="input-with-icon">
                                        <MapPin size={18} />
                                        <input
                                            id="direccion"
                                            name="direccion"
                                            placeholder="Dirección completa"
                                            value={formData.direccion}
                                            onChange={handleChange}
                                            className="styled-input"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="activo"
                                        checked={formData.activo}
                                        onChange={handleChange}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="checkbox-text">Empleado Activo</span>
                                </label>
                                <p className="checkbox-description">
                                    Los empleados inactivos no podrán acceder al sistema ni ser asignados a nuevas tareas.
                                </p>
                            </div>
                        </div>

                        {/* Acciones del Formulario */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={submitting || loading}
                            >
                                {submitting ? (
                                    <>
                                        <Loader size={18} className="spinner" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {mode === 'create' ? 'Registrar Empleado' : 'Guardar Cambios'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}