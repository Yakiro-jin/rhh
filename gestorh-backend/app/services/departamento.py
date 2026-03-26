from app.database_connector import connect
from app.models.departamento import Departamento

# ---------------------------------------------------------
# 1. REGISTRAR DEPARTAMENTO
# ---------------------------------------------------------
def registrar_departamento(datos):
    """
    Crea un nuevo área en el hotel (ej. Cocina, Recepción).
    """
    try:
        conn = connect()
        cursor = conn.cursor(dictionary=True)
        
        # Validamos si ya existe por nombre (el nombre es UNIQUE en SQL)
        cursor.execute("SELECT id FROM departamentos WHERE nombre = %s", (datos['nombre'],))
        if cursor.fetchone():
            return {"error": f"El departamento '{datos['nombre']}' ya existe"}, 400

        # Insertamos
        query = "INSERT INTO departamentos (nombre, descripcion) VALUES (%s, %s)"
        cursor.execute(query, (datos['nombre'], datos['descripcion']))
        
        conn.commit()
        return {"message": "Departamento registrado exitosamente"}, 201

    except Exception as e:
        print(f"❌ Error en registrar_departamento: {e}")
        return {"error": "Error interno al registrar departamento"}, 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# ---------------------------------------------------------
# 2. LISTAR DEPARTAMENTOS
# ---------------------------------------------------------
def listar_departamentos():
    """
    Retorna todos los departamentos para llenar los Select/Dropdowns en React.
    """
    try:
        conn = connect()
        cursor = conn.cursor(dictionary=True)
        
        # Opcional: Podrías contar cuántos empleados tiene cada depto con un JOIN
        cursor.execute("SELECT * FROM departamentos ORDER BY nombre ASC")
        departamentos = cursor.fetchall()
        
        return departamentos, 200
    except Exception as e:
        print(f"❌ Error en listar_departamentos: {e}")
        return {"error": "No se pudo obtener la lista"}, 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# ---------------------------------------------------------
# 3. OBTENER UN DEPARTAMENTO
# ---------------------------------------------------------
def obtener_departamento(id):
    try:
        conn = connect()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM departamentos WHERE id = %s", (id,))
        departamento = cursor.fetchone()
        
        if not departamento:
            return {"error": "Departamento no encontrado"}, 404
            
        return departamento, 200
    except Exception as e:
        print(f"❌ Error en obtener_departamento: {e}")
        return {"error": "Error al buscar el departamento"}, 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# ---------------------------------------------------------
# 4. ACTUALIZAR DEPARTAMENTO
# ---------------------------------------------------------
def actualizar_departamento(id, datos):
    """
    Permite cambiar nombre o descripción.
    """
    try:
        conn = connect()
        cursor = conn.cursor()

        # Verificamos si existe antes de intentar el update
        cursor.execute("SELECT id FROM departamentos WHERE id = %s", (id,))
        if not cursor.fetchone():
            return {"error": "Departamento no encontrado"}, 404

        query = """
            UPDATE departamentos 
            SET nombre = %s, descripcion = %s
            WHERE id = %s
        """
        cursor.execute(query, (datos['nombre'], datos['descripcion'], id))

        conn.commit()
        return {"message": "Departamento actualizado correctamente"}, 200

    except Exception as e:
        print(f"❌ Error en actualizar_departamento: {e}")
        return {"error": "Error al actualizar"}, 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()