from flask import Blueprint, request, jsonify
from app.services.cargo import CargoService
from app.services.auth import obtener_sesion_actual

cargo_bp = Blueprint('cargos', __name__)

@cargo_bp.route('/cargos', methods=['POST'])
def registrar_nuevo_cargo():
    """
    Endpoint para crear un cargo. 
    Delega la instanciación y validación al CargoService.
    """
    # 1. Seguridad: Verificar que el usuario esté logueado
    sesion = obtener_sesion_actual()
    if not sesion:
        return jsonify({"error": "No autorizado. Inicie sesión para continuar."}), 401
    
    # 2. Captura de datos del frontend
    datos = request.get_json()
    if not datos:
        return jsonify({"error": "No se recibieron datos en la solicitud"}), 400

    try:
        # 3. Llamada al servicio (donde ocurre la magia de la instanciación)
        resultado, status = CargoService.crear_cargo(datos)
        
        return jsonify(resultado), status

    except Exception as e:
        print(f"❌ Error en la ruta /cargos: {e}")
        return jsonify({"error": "Ocurrió un error inesperado en el servidor"}), 500

@cargo_bp.route('/cargos', methods=['GET'])
def listar_cargos_por_departamento():
    """
    Endpoint para listar cargos filtrados por departamento.
    """
    sesion = obtener_sesion_actual()
    if not sesion:
        return jsonify({"error": "No autorizado"}), 401
    
    # Obtenemos el departamento_id de la URL (?departamento_id=X)
    depto_id = request.args.get('departamento_id')
    
    try:
        cargos = CargoService.obtener_cargos_por_departamento(depto_id)
        return jsonify(cargos), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener la lista de cargos"}), 500