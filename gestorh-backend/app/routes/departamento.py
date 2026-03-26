from flask import request, jsonify, Blueprint
import app.services.departamento as servicio_departamento
from app.services.auth import obtener_sesion_actual

departamento_bp = Blueprint('departamentos', __name__)

# ---------------------------------------------------------
# 1. LISTAR DEPARTAMENTOS (Cualquiera con sesión puede verlos)
# ---------------------------------------------------------
@departamento_bp.route('/departamentos', methods=['GET'])
def listar_departamentos():
    # Verificamos si hay una sesión activa antes de listar
    sesion = obtener_sesion_actual()
    if not sesion:
        return jsonify({"error": "No autorizado. Inicie sesión"}), 401

    resultado, status = servicio_departamento.listar_departamentos()
    return jsonify(resultado), status

# ---------------------------------------------------------
# 2. OBTENER UN DEPARTAMENTO POR ID
# ---------------------------------------------------------
@departamento_bp.route('/departamentos/<int:id>', methods=['GET'])
def obtener_departamento(id):
    resultado, status = servicio_departamento.obtener_departamento(id)
    return jsonify(resultado), status

# ---------------------------------------------------------
# 3. REGISTRAR DEPARTAMENTO (Solo Admin)
# ---------------------------------------------------------
@departamento_bp.route('/departamentos', methods=['POST'])
def registrar_departamento():
    # Seguridad: Solo RRHH (Admin) crea departamentos
    sesion = obtener_sesion_actual()
    if sesion.get("rol") != "admin":
        return jsonify({"error": "No tienes permisos para crear departamentos"}), 403

    datos = request.get_json()
    if not datos or "nombre" not in datos:
        return jsonify({"error": "El nombre del departamento es obligatorio"}), 400

    resultado, status = servicio_departamento.registrar_departamento(datos)
    return jsonify(resultado), status

# ---------------------------------------------------------
# 4. ACTUALIZAR DEPARTAMENTO (Solo Admin)
# ---------------------------------------------------------
@departamento_bp.route('/departamentos/<int:id>', methods=['PUT'])
def actualizar_departamento(id):
    sesion = obtener_sesion_actual()
    if sesion.get("rol") != "admin":
        return jsonify({"error": "No tienes permisos para editar departamentos"}), 403

    datos = request.get_json()
    resultado, status = servicio_departamento.actualizar_departamento(id, datos)
    return jsonify(resultado), status