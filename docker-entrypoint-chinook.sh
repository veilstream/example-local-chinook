#!/bin/bash
set -e

# Remove data directory if it exists to force reinitialization
if [ -d "/var/lib/postgresql/data" ] && [ "$(ls -A /var/lib/postgresql/data)" ]; then
    echo "Removing existing data directory to force reinitialization..."
    rm -rf /var/lib/postgresql/data/*
fi

# Call the original postgres entrypoint
exec /usr/local/bin/docker-entrypoint.sh "$@"

