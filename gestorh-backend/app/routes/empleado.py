from flask import Blueprint, request, jsonify
from app.services.empleado import (
    registrar_empleado,
    listar_empleados,
    obtener_empleado_por_id,
    actualizar_empleado,
    actualizar_estatus
)
from app.services.auth import obtener_sesion_actual

empleado_bp = Blueprint("empleados", __name__)

# ---------------------------------------
# REGISTRAR EMPLEADO
# ---------------------------------------
@empleado_bp.route("/empleados", methods=["POST"])
def ruta_registrar_empleado():
    # Solo administradores de RRHH deberían registrar empleados
    session = obtener_sesion_actual()
    if session.get("rol") != "admin":
        return jsonify({"error": "No tienes permisos para realizar esta acción"}), 403

    datos = request.json
    # Llamamos al servicio y desempaquetamos la respuesta
    resultado, status_code = registrar_empleado(datos)
    return jsonify(resultado), status_code

# ---------------------------------------
# LISTAR EMPLEADOS
# ---------------------------------------
@empleado_bp.route("/empleados", methods=["GET"])
def ruta_listar_empleados():
    session = obtener_sesion_actual()
    rol = session.get("rol")
    
    # Seguridad: Un supervisor solo debería ver empleados, un admin a todos.
    if not rol:
        return jsonify({"error": "Sesión no válida"}), 401

    try:
        empleados = listar_empleados()
        return jsonify(empleados), 200
    except Exception as e:
        print(f"Error en ruta_listar: {e}")
        return jsonify({"error": "Error interno al obtener la lista"}), 500

# ---------------------------------------
# OBTENER EMPLEADO POR ID
# ---------------------------------------
@empleado_bp.route("/empleados/<int:id>", methods=["GET"])
def ruta_obtener_empleado_por_id(id):
    session = obtener_sesion_actual()
    rol = session.get("rol")
    usuario_empleado_id = session.get("empleadoId")

    if not rol:
        return jsonify({"error": "No autenticado"}), 401

    # REGLA: Un supervisor o admin puede ver a cualquiera, 
    # pero si implementaras un rol "empleado" puro, solo podría verse a sí mismo.
    # Como simplificamos los roles, validamos que el usuario tenga sesión activa.
    
    resultado = obtener_empleado_por_id(id)
    
    if isinstance(resultado, tuple):
        return jsonify(resultado[0]), resultado[1]
        
    return jsonify(resultado), 200

# ---------------------------------------
# ACTUALIZAR EMPLEADO
# ---------------------------------------
@empleado_bp.route("/empleados/<int:id>", methods=["PUT"])
def ruta_actualizar_empleado(id):
    session = obtener_sesion_actual()
    if session.get("rol") != "admin":
        return jsonify({"error": "No tienes permisos"}), 403

    datos = request.json
    resultado, status_code = actualizar_empleado(id, datos)
    return jsonify(resultado), status_code

# ---------------------------------------
# CAMBIAR ESTATUS
# ---------------------------------------
@empleado_bp.route("/empleados/<int:id>/estatus", methods=["PUT"])
def ruta_cambiar_estatus(id):
    session = obtener_sesion_actual()
    if session.get("rol") != "admin":
        return jsonify({"error": "No tienes permisos"}), 403

    datos = request.json
    estatus = datos.get("estatus")
    
    if not estatus:
        return jsonify({"error": "Se requiere el nuevo estatus"}), 400
        
    resultado, status_code = actualizar_estatus(id, estatus)
    return jsonify(resultado), status_code