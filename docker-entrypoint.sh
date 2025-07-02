#!/bin/sh

echo "Waiting for db to be ready..."
sleep 5

echo "Running db migrations..."
pnpm db:push

echo "Checking if database has data..."
# seed the database (if data doesn't exist)
pnpm seed || echo "data already exists"

echo "Starting..."
exec "$@"
