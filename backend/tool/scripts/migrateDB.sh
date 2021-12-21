if [ -f ./database.json ]; then
  node node_modules/db-migrate/bin/db-migrate up --config database.json -e dev -m backend/database/migrations
fi