from app.database_connector import connect, get_dict_cursor
from app.models.cargo import Cargo  # Importamos tu clase original

class CargoService:
    @staticmethod
    def crear_cargo(datos):
        """
        Servicio para registrar un nuevo cargo instanciando el modelo.
        """
        conn = None
        cursor = None
        try:
            # 1. Extracción de datos
            nombre = datos.get('nombre')
            departamento_id = datos.get('departamento_id')

            # 2. Validaciones básicas de negocio
            if not nombre:
                raise ValueError("El nombre del cargo es obligatorio")

            # 3. INSTANCIAR EL MODELO (como en tu ejemplo de empleado)
            # Pasamos None en ID porque la base de datos lo generará (AUTO_INCREMENT)
            nuevo_cargo = Cargo(
                id=None, 
                nombre=nombre, 
                departamento_id=departamento_id
            )

            # 4. Conexión y persistencia
            conn = connect()
            cursor = get_dict_cursor(conn)

            # Verificación de duplicados antes de insertar
            cursor.execute(
                "SELECT id FROM cargos WHERE nombre = %s AND departamento_id = %s",
                (nuevo_cargo.nombre, nuevo_cargo.departamento_id)
            )
            existente = cursor.fetchone()

            if existente:
                return {"id": existente['id'], "message": "El cargo ya se encuentra registrado"}, 200

            # Inserción usando los atributos de la instancia del modelo
            query = "INSERT INTO cargos (nombre, departamento_id) VALUES (%s, %s)"
            valores = (nuevo_cargo.nombre, nuevo_cargo.departamento_id)
            
            cursor.execute(query, valores)
            conn.commit()

            return {
                "id": cursor.lastrowid, 
                "message": "Cargo registrado exitosamente mediante instancia de modelo"
            }, 201

        except ValueError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            print(f"❌ Error en CargoService.crear_cargo: {e}")
            return {"error": "Error interno al procesar el registro del cargo"}, 500
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

    @staticmethod
    def obtener_cargos_por_departamento(departamento_id=None):
        """
        Lista cargos instanciando el modelo para cada fila encontrada.
        """
        conn = None
        cursor = None
        try:
            conn = connect()
            cursor = conn.cursor(dictionary=True)

            if departamento_id:
                cursor.execute("SELECT * FROM cargos WHERE departamento_id = %s", (departamento_id,))
            else:
                cursor.execute("SELECT * FROM cargos")

            rows = cursor.fetchall()
            
            # Instanciación masiva del modelo
            return [Cargo(row['id'], row['nombre'], row['departamento_id']).to_dict() for row in rows]

        except Exception as e:
            print(f"❌ Error en CargoService.listar: {e}")
            raise e
        finally:
            if cursor: cursor.close()
            if conn: conn.close()