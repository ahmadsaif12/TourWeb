#!/bin/sh
set -e

until python manage.py migrate --noinput; do
  echo "Waiting for database..."
  sleep 2
done

python manage.py collectstatic --noinput
python manage.py seed_demo_data

exec gunicorn config.wsgi:application --bind 0.0.0.0:8000
