from app.database_connector import connect
from app.models.empleado import Empleado
from datetime import datetime, date

# -----------------------------
# VALIDACIONES
# -----------------------------
def validar_campos_obligatorios(datos):
    # Ajustado a los nombres del nuevo modelo/SQL
    obligatorios = ["nombre", "apellido", "cedula", "email_personal", "departamento_id", "cargo_id", "fecha_ingreso"]
    for campo in obligatorios:
        if campo not in datos or datos[campo] in ("", None):
            raise ValueError(f"El campo '{campo}' es obligatorio")

def validar_unicos(cedula, email_personal, empleado_id=None):
    conn = connect()
    cursor = conn.cursor(dictionary=True)
    
    # Validar Cédula
    cursor.execute("SELECT id FROM empleados WHERE cedula = %s AND id != %s", (cedula, empleado_id or -1))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        raise ValueError("La cédula ya está registrada")

    # Validar Email
    cursor.execute("SELECT id FROM empleados WHERE email_personal = %s AND id != %s", (email_personal, empleado_id or -1))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        raise ValueError("El correo ya está registrado")

    cursor.close()
    conn.close()

def validar_existencia_entidades(departamento_id, cargo_id):
    conn = connect()
    cursor = conn.cursor(dictionary=True)

    # Validar Departamento
    cursor.execute("SELECT id FROM departamentos WHERE id = %s", (departamento_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        raise ValueError("El departamento seleccionado no existe")

    # Validar Cargo
    cursor.execute("SELECT id FROM cargos WHERE id = %s", (cargo_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        raise ValueError("El cargo seleccionado no existe")

    cursor.close()
    conn.close()

# -----------------------------
# REGISTRAR EMPLEADO
# -----------------------------
def registrar_empleado(datos):
    conn = None
    cursor = None
    try:
        # 1. Validaciones
        validar_campos_obligatorios(datos)
        validar_unicos(datos["cedula"], datos["email_personal"])
        validar_existencia_entidades(datos["departamento_id"], datos["cargo_id"])

        # 2. Crear instancia del modelo
        # Usamos argumentos explícitos para ignorar campos que vengan del frontend 
        # pero que no estén en el modelo (como fecha_nacimiento o direccion)
        empleado = Empleado(
            cedula=datos['cedula'],
            nombre=datos['nombre'],
            apellido=datos['apellido'],
            email_personal=datos['email_personal'],
            fecha_ingreso=datos['fecha_ingreso'],
            cargo_id=datos['cargo_id'],
            departamento_id=datos['departamento_id'],
            telefono=datos.get('telefono'),
            estatus=datos.get('estatus', 'activo')
        )

        # 3. Insertar en DB
        conn = connect()
        cursor = conn.cursor()
        
        query = """
            INSERT INTO empleados 
            (cedula, nombre, apellido, email_personal, telefono, fecha_ingreso, cargo_id, departamento_id, estatus)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        valores = (
            empleado.cedula,
            empleado.nombre,
            empleado.apellido,
            empleado.email_personal,
            empleado.telefono,
            empleado.fecha_ingreso,
            empleado.cargo_id,
            empleado.departamento_id,
            empleado.estatus
        )
        
        cursor.execute(query, valores)
        conn.commit()
        
        return {"message": "Empleado registrado exitosamente", "id": cursor.lastrowid}, 201

    except ValueError as e:
        return {"error": str(e)}, 400
    except Exception as e:
        print(f"❌ Error: {e}")
        return {"error": "Error interno del servidor"}, 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# -----------------------------
# LISTAR EMPLEADOS
# -----------------------------
def listar_empleados():
    conn = connect()
    cursor = conn.cursor(dictionary=True)
    
    # Hacemos un JOIN para traer los nombres de departamento y cargo en lugar de solo IDs
    query = """
        SELECT e.*, d.nombre as departamento_nombre, c.nombre as cargo_nombre 
        FROM empleados e
        LEFT JOIN departamentos d ON e.departamento_id = d.id
        LEFT JOIN cargos c ON e.cargo_id = c.id
    """
    cursor.execute(query)
    empleados = cursor.fetchall()
    
    # Formatear fechas para JSON
    for emp in empleados:
        if isinstance(emp['fecha_ingreso'], (date, datetime)):
            emp['fecha_ingreso'] = emp['fecha_ingreso'].strftime('%Y-%m-%d')
            
    cursor.close()
    conn.close()
    return empleados

# -----------------------------
# OBTENER POR ID (Con Antigüedad)
# -----------------------------
def obtener_empleado_por_id(id):
    conn = connect()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM empleados WHERE id = %s", (id,))
        emp = cursor.fetchone()

        if not emp:
            return {"error": "Empleado no encontrado"}, 404

        # Cálculo de Antigüedad
        if emp["fecha_ingreso"]:
            fecha_v = emp["fecha_ingreso"]
            hoy = date.today()
            anios = hoy.year - fecha_v.year - ((hoy.month, hoy.day) < (fecha_v.month, fecha_v.day))
            emp["antiguedad"] = f"{anios} años"
            emp["fecha_ingreso"] = fecha_v.strftime('%Y-%m-%d')

        return emp
    finally:
        cursor.close()
        conn.close()

# -----------------------------
# ACTUALIZAR EMPLEADO
# -----------------------------
def actualizar_empleado(id, datos):
    conn = None
    cursor = None
    try:
        # 1. Validar que el empleado exista
        emp_actual = obtener_empleado_por_id(id)
        if "error" in emp_actual:
            return emp_actual, 404

        # 2. Validaciones de negocio (ignorar propios registros al chequear duplicados)
        if "cedula" in datos:
            validar_unicos(datos["cedula"], datos.get("email_personal", ""), empleado_id=id)
        
        # Validar cargo y departamento solo si se envían
        dept_id = datos.get("departamento_id") or emp_actual["departamento_id"]
        cargo_id = datos.get("cargo_id") or emp_actual["cargo_id"]
        
        if "departamento_id" in datos or "cargo_id" in datos:
            validar_existencia_entidades(dept_id, cargo_id)

        # 3. Construir query dinámica
        campos_update = []
        valores = []
        
        # Mapa de campos permitidos para actualización
        campos_permitidos = [
            "cedula", "nombre", "apellido", "email_personal", 
            "telefono", "fecha_ingreso", "cargo_id", "departamento_id", "estatus"
        ]

        for campo in campos_permitidos:
            if campo in datos:
                campos_update.append(f"{campo} = %s")
                valores.append(datos[campo])

        if not campos_update:
            return {"message": "No se enviaron datos para actualizar"}, 200

        valores.append(id) # Para el WHERE
        
        # 4. Actualizar en DB
        conn = connect()
        cursor = conn.cursor()
        
        query = f"UPDATE empleados SET {', '.join(campos_update)} WHERE id = %s"
        cursor.execute(query, tuple(valores))
        conn.commit()
        
        return {"message": "Empleado actualizado exitosamente"}, 200

    except ValueError as e:
        return {"error": str(e)}, 400
    except Exception as e:
        print(f"❌ Error actualizando empleado: {e}")
        return {"error": "Error interno al actualizar"}, 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# -----------------------------
# CAMBIAR ESTATUS
# -----------------------------
def actualizar_estatus(id, nuevo_estatus):
    if nuevo_estatus not in ['activo', 'inactivo']:
        return {"error": "Estatus inválido. Use 'activo' o 'inactivo'"}, 400

    conn = None
    cursor = None
    try:
        conn = connect()
        cursor = conn.cursor()
        
        # Verificar existencia
        cursor.execute("SELECT id FROM empleados WHERE id = %s", (id,))
        if not cursor.fetchone():
            return {"error": "Empleado no encontrado"}, 404
            
        # Actualizar
        cursor.execute("UPDATE empleados SET estatus = %s WHERE id = %s", (nuevo_estatus, id))
        conn.commit()
        
        return {"message": "Estatus actualizado correctamente"}, 200
        
    except Exception as e:
        print(f"❌ Error actualizando estatus: {e}")
        return {"error": "Error interno del servidor"}, 500
    finally:
        if cursor: cursor.close()
        if conn: conn.close()