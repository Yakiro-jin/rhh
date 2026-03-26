import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from flask import request
from app.database_connector import connect

SECRET_KEY = os.getenv("SECRET_KEY", "clave_super_segura_sunsol")

def generar_token(empleado_id, rol, departamento_id):
    payload = {
        "empleado_id": empleado_id,
        "rol": rol,
        "departamento_id": departamento_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=4)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

# ---------------------------------------------------------
# LOGIN SERVICE (Blindado)
# ---------------------------------------------------------
def login_service(email, password):
    conn = connect()
    cursor = conn.cursor(dictionary=True)
    try:
        # Usamos LEFT JOIN para que no explote si el empleado no está bien configurado
        query = """
            SELECT u.*, e.departamento_id, e.nombre, e.apellido 
            FROM usuarios u
            LEFT JOIN empleados e ON u.empleado_id = e.id
            WHERE u.email = %s AND u.activo = 1
        """
        cursor.execute(query, (email,))
        user = cursor.fetchone()

        # Validamos existencia y contraseña
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            
            # CONTROL DE NULOS: Si el LEFT JOIN trajo campos vacíos del empleado
            nombre = user.get('nombre') or "Usuario"
            apellido = user.get('apellido') or ""
            
            token = generar_token(
                user.get('empleado_id'), 
                user.get('rol'), 
                user.get('departamento_id')
            )
            
            return {
                "token": token,
                "rol": user['rol'],
                "nombre_completo": f"{nombre} {apellido}".strip(),
                "empleado_id": user['empleado_id'],
                "departamento_id": user['departamento_id']
            }
        return None
    except Exception as e:
        print(f"❌ Error en login_service: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

# ---------------------------------------------------------
# CREAR USUARIO (Con seguridad de Admin)
# ---------------------------------------------------------
def crear_usuario(datos):
    conn = connect()
    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Buscar empleado por cédula
        cursor.execute("SELECT id FROM empleados WHERE cedula = %s", (datos.get('cedula'),))
        empleado = cursor.fetchone()
        
        if not empleado:
            return {"error": "Cédula no encontrada en ficha de empleados"}, 404
            
        id_emp = empleado['id']

        # 2. Evitar duplicados
        cursor.execute("SELECT id FROM usuarios WHERE empleado_id = %s OR email = %s", (id_emp, datos.get('email')))
        if cursor.fetchone():
            return {"error": "El empleado o correo ya tienen un usuario asociado"}, 400

        # 3. Encriptar Password
        hashed_pw = bcrypt.hashpw(datos['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # 4. Insertar
        query = """
            INSERT INTO usuarios (username, password, email, rol, empleado_id, activo) 
            VALUES (%s, %s, %s, %s, %s, 1)
        """
        cursor.execute(query, (
            datos['username'],
            hashed_pw,
            datos['email'],
            datos['rol'],
            id_emp
        ))
        conn.commit()
        return {"message": "Usuario creado exitosamente"}, 201

    except Exception as e:
        print(f"❌ Error en registro: {e}")
        return {"error": "Error interno del servidor"}, 500
    finally:
        cursor.close()
        conn.close()

def obtener_sesion_actual():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {}
    token = auth_header.split(" ")[1]
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except:
        return {}