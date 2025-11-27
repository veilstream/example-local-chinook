#!/bin/bash
set -e

echo "Custom Chinook entrypoint: Checking for existing database..."

# Remove data directory if PostgreSQL has been initialized
# PostgreSQL checks for PG_VERSION file to determine if database is initialized
if [ -f "/var/lib/postgresql/data/PG_VERSION" ]; then
    echo "WARNING: Found existing PostgreSQL data (PG_VERSION exists)"
    echo "Removing existing PostgreSQL data directory to force reinitialization..."
    echo "This ensures initialization scripts in /docker-entrypoint-initdb.d/ will run."
    
    # Remove all files and directories
    find /var/lib/postgresql/data -mindepth 1 -delete 2>/dev/null || {
        # Fallback: try rm -rf if find fails
        rm -rf /var/lib/postgresql/data/* /var/lib/postgresql/data/.[!.]* 2>/dev/null || true
    }
    
    echo "Data directory cleared. PostgreSQL will reinitialize on startup."
elif [ -d "/var/lib/postgresql/data" ] && [ "$(ls -A /var/lib/postgresql/data 2>/dev/null)" ]; then
    echo "WARNING: Data directory exists but PG_VERSION not found. Clearing anyway to be safe."
    find /var/lib/postgresql/data -mindepth 1 -delete 2>/dev/null || {
        rm -rf /var/lib/postgresql/data/* /var/lib/postgresql/data/.[!.]* 2>/dev/null || true
    }
else
    echo "Data directory is empty or doesn't exist. PostgreSQL will initialize fresh."
fi

# Call the original postgres entrypoint
exec /usr/local/bin/docker-entrypoint.sh "$@"

