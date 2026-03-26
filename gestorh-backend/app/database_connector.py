import psycopg2
import os
from dotenv import load_dotenv

# 1. Cargamos las variables del archivo .env
load_dotenv()

def connect():
    return psycopg2.connect(
        # 2. Usamos os.getenv para buscar los valores en el .env
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT', '5432'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )