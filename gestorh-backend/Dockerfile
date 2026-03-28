FROM python:3.10-slim

# Instalar dependencias del sistema para psycopg2
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponer el puerto del backend (originalmente era 5000, pero Docker-compose lo mapea a 5005)
EXPOSE 5000

CMD ["python", "run.py"]