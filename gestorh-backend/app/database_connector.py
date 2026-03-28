import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv

# 1. Cargamos las variables del archivo .env
load_dotenv()

def connect():
    try:
        conn = psycopg2.connect(
            # 2. Usamos os.getenv para buscar los valores en el .env
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT', '5432'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            connect_timeout=5
        )
        return conn
    except Exception as e:
        print(f"❌ Error conectando a la base de datos: {e}")
        raise e

def get_dict_cursor(conn):
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)