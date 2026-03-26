import React, { useState, useEffect } from "react";
import api from "../services/api";
import { X, Building2, Save, Loader } from "lucide-react";
import "../styles/DepartamentoModal.css";

export default function DepartamentoModal({
    isOpen,
    onClose,
    departamento,
    refreshData,
    mode = 'create'
}) {
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: ""
    });

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (mode === 'edit' && departamento) {
            setFormData({
                nombre: departamento.nombre || "",
                descripcion: departamento.descripcion || ""
            });
        }
    }, [mode, departamento]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            if (mode === 'create') {
                await api.post("/departamentos", formData);
            } else {
                await api.put(`/departamentos/${departamento.id}`, formData);
            }

            refreshData();
            onClose();
        } catch (err) {
            console.error("Error guardando departamento:", err);
            setError(err.response?.data?.error || "No se pudo guardar el departamento");
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
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h2>{mode === 'create' ? 'Nuevo Departamento' : 'Editar Departamento'}</h2>
                                <p>{mode === 'create' ? 'Registra un nuevo departamento' : 'Modifica la información del departamento'}</p>
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

                        <div className="form-group">
                            <label htmlFor="nombre">
                                <span className="required">*</span> Nombre del Departamento
                            </label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                placeholder="Ej: Recepción, Mantenimiento, RRHH"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="descripcion">
                                Descripción
                            </label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                placeholder="Describe las funciones y responsabilidades del departamento..."
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="4"
                                className="form-textarea"
                            />
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
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader size={18} className="spinner" />
                                        {mode === 'create' ? 'Creando...' : 'Actualizando...'}
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {mode === 'create' ? 'Crear Departamento' : 'Guardar Cambios'}
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