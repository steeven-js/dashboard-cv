#!/bin/bash

# Attendre que la base de données soit prête
# C'est surtout utile dans un contexte où vous auriez une base de données PostgreSQL ou MySQL
# Dans le cas de Supabase, on peut juste procéder

# Appliquer les migrations
echo "Applying migrations..."
python manage.py migrate

# Collecter les fichiers statiques
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Création d'un superutilisateur si l'environnement le spécifie
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "Creating superuser..."
    python manage.py createsuperuser --noinput
fi

exec "$@"
