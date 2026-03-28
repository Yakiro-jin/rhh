import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv

# 1. Cargamos las variables del archivo .env
load_dotenv()

def connect():
    host = os.getenv('DB_HOST')
    port = os.getenv('DB_PORT', '5432')
    user = os.getenv('DB_USER')
    password = os.getenv('DB_PASSWORD')
    dbname = os.getenv('DB_NAME')

    # Logging para debugging (OJO: No mostramos el password completo por seguridad)
    print(f"DEBUG: Intentando conectar a {user}@{host}:{port}/{dbname}")

    if not host or not user or not dbname:
        error_msg = f"Faltan variables de entorno críticas (HOST={bool(host)}, USER={bool(user)}, DB={bool(dbname)})"
        print(f"❌ {error_msg}")
        raise EnvironmentError(error_msg)

    try:
        # Forzamos conexión vía TCP/IP para evitar que intente usar sockets locales (/var/run/...)
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=dbname,
            connect_timeout=10
        )
        return conn
    except Exception as e:
        print(f"❌ Error conectando a la base de datos (TCP/IP): {e}")
        raise e

def get_dict_cursor(conn):
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)