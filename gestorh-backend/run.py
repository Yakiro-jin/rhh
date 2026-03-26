# Importación de librerías necesarias de Flask
from flask import Flask, request, jsonify
from flask_cors import CORS
# Importación de los Blueprints (módulos de rutas) para organizar la aplicación
from app.routes.empleado import empleado_bp
from app.routes.cargo import cargo_bp
from app.routes.auth import auth_bp
from app.routes.departamento import departamento_bp

# Inicialización de la aplicación Flask
app = Flask(__name__)

# Configuración explícita de CORS para manejar peticiones preflight (OPTIONS)
CORS(app, resources={r"/*": {
    "origins": "*",  # Permite peticiones desde cualquier origen
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Métodos HTTP permitidos
    "allow_headers": ["Content-Type", "Authorization"]  # Headers permitidos
}})


# Ruta principal para verificar que el servidor está corriendo
@app.route("/")
def home():
    return {"message": "Bienvenido a SIGRH"}

# Registro de los Blueprints con sus respectivas rutas
app.register_blueprint(empleado_bp, url_prefix='')      # Rutas de empleados
app.register_blueprint(cargo_bp, url_prefix='')      # Rutas de cargos
app.register_blueprint(auth_bp, url_prefix='/auth')          # Rutas de autenticación
app.register_blueprint(departamento_bp, url_prefix='')  # Rutas de departamentos

# Punto de entrada principal: Ejecuta el servidor si este archivo es el main
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

