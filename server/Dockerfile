FROM python:3.9-slim

WORKDIR /app

# Installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 8000

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=config.settings

# Script d'entrée
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

# Commande par défaut
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "config.wsgi:application"]
