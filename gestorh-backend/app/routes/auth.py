import os
import requests
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
import app.services.auth as servicio
from app.database_connector import connect, get_dict_cursor

# Cargamos las variables del .env
load_dotenv()

auth_bp = Blueprint("auth", __name__)

# ---------------------------------------------------------
# 1. LOGIN (Inicio de Sesión)
# ---------------------------------------------------------
@auth_bp.route("/login", methods=["POST"])
def login_route():
    data = request.get_json()
    
    # Llamamos al servicio que ahora nos trae nombre y depto_id
    resultado = servicio.login_service(data.get("email"), data.get("password"))

    if not resultado:
        return jsonify({"error": "Credenciales inválidas o cuenta inactiva"}), 401

    return jsonify(resultado), 200

# ---------------------------------------------------------
# 2. VERIFICAR EMPLEADO (Antes de crear el usuario)
# ---------------------------------------------------------
@auth_bp.route("/verificar-empleado/<cedula>", methods=["GET"])
def verificar_empleado(cedula):
    """
    Ruta para que el Admin valide a quién le va a crear la cuenta.
    Evita errores humanos al tipear la cédula.
    """
    conn = connect()
    cursor = get_dict_cursor(conn)
    
    query = """
        SELECT e.id, e.nombre, e.apellido, d.nombre as departamento
        FROM empleados e
        JOIN departamentos d ON e.departamento_id = d.id
        LEFT JOIN usuarios u ON e.id = u.empleado_id
        WHERE e.cedula = %s AND u.id IS NULL
    """
    cursor.execute(query, (cedula,))
    empleado = cursor.fetchone()
    
    cursor.close()
    conn.close()

    if not empleado:
        return jsonify({"error": "Empleado no encontrado o ya posee usuario"}), 404
        
    return jsonify(empleado), 200

# ---------------------------------------------------------
# 3. CREAR USUARIO (Registro por Cédula)
# ---------------------------------------------------------
@auth_bp.route("/usuarios", methods=["POST"])
def crear_usuario():
    # Validamos que quien crea el usuario sea ADMIN
    sesion = servicio.obtener_sesion_actual()
    if sesion.get("rol") != "admin":
        return jsonify({"error": "No tiene permisos para crear usuarios"}), 403

    data = request.get_json()
    
    # El servicio ahora se encarga de buscar el ID por la cédula enviada
    resultado, status = servicio.crear_usuario(data)

    # Si se creó con éxito, disparamos el flujo de n8n
    if status == 201:
        n8n_base_url = os.getenv("N8N_API_URL", "http://gestorh-n8n:5678")
        webhook_url = f"{n8n_base_url}/webhook/nuevo-usuario"

        try:
            # Enviamos a n8n para el correo de bienvenida
            requests.post(webhook_url, json={
                "email": data["email"],
                "username": data["username"],
                "password": data["password"], # Solo para el correo inicial
                "rol": data["rol"]
            }, timeout=3)
        except Exception as e:
            print(f"⚠️ Error enviando a n8n: {e}")

    return jsonify(resultado), status

# ---------------------------------------------------------
# 4. LISTAR USUARIOS (Gestión de cuentas)
# ---------------------------------------------------------
@auth_bp.route("/usuarios", methods=["GET"])
def listar_usuarios():
    # Solo el admin debería gestionar cuentas
    sesion = servicio.obtener_sesion_actual()
    if sesion.get("rol") != "admin":
        return jsonify({"error": "Acceso restringido"}), 403

    conn = connect()
    cursor = get_dict_cursor(conn)
    
    # JOIN para mostrar nombres reales en lugar de solo IDs
    query = """
        SELECT u.id, u.username, u.email, u.rol, u.activo, e.nombre, e.apellido 
        FROM usuarios u
        JOIN empleados e ON u.empleado_id = e.id
    """
    cursor.execute(query)
    usuarios = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return jsonify(usuarios), 200