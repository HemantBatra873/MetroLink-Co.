#!/bin/bash
set -euo pipefail

# Runs once on first PostgreSQL volume initialization.
# Creates four service-owned logical databases.
# Local apps connect as POSTGRES_USER (metrolink); database name is the ownership boundary.
# EF Core migrations own schema/tables inside each database.

for db_name in identity_db enforcement_db parking_db payment_db; do
  exists="$(psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_database WHERE datname='${db_name}'")"
  if [ "$exists" != "1" ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "CREATE DATABASE ${db_name};"
  fi
done

echo "Logical databases ready: identity_db, enforcement_db, parking_db, payment_db"
