#!/bin/bash
set -e

# Force output to stderr so it shows up in logs even if stdout is buffered
exec 1>&2

echo "=== Custom Chinook entrypoint: Starting ===" >&2

# Determine PGDATA location (defaults to /var/lib/postgresql/data, but can be overridden)
PGDATA="${PGDATA:-/var/lib/postgresql/data}"
echo "Checking for existing database at ${PGDATA}..." >&2

# Also check for PostgreSQL version-specific directories (e.g., /var/lib/postgresql/18/docker)
# PostgreSQL 18+ may use different directory structures
for dir in "${PGDATA}" "/var/lib/postgresql/data" "/var/lib/postgresql/18/docker" "/var/lib/postgresql/16/data"; do
    if [ -d "$dir" ]; then
        echo "Found potential data directory: $dir" >&2
        # Remove data directory if PostgreSQL has been initialized
        # PostgreSQL checks for PG_VERSION file to determine if database is initialized
        if [ -f "$dir/PG_VERSION" ]; then
            echo "WARNING: Found existing PostgreSQL data (PG_VERSION exists in $dir)" >&2
            echo "Removing existing PostgreSQL data directory to force reinitialization..." >&2
            echo "This ensures initialization scripts in /docker-entrypoint-initdb.d/ will run." >&2
            
            # Remove all files and directories
            find "$dir" -mindepth 1 -delete 2>/dev/null || {
                # Fallback: try rm -rf if find fails
                echo "Using fallback removal method for $dir..." >&2
                rm -rf "$dir"/* "$dir"/.[!.]* 2>/dev/null || true
            }
            
            echo "Data directory $dir cleared. PostgreSQL will reinitialize on startup." >&2
        elif [ "$(ls -A "$dir" 2>/dev/null)" ]; then
            echo "WARNING: Data directory $dir exists but PG_VERSION not found. Clearing anyway to be safe." >&2
            find "$dir" -mindepth 1 -delete 2>/dev/null || {
                rm -rf "$dir"/* "$dir"/.[!.]* 2>/dev/null || true
            }
            echo "Data directory $dir cleared." >&2
        fi
    fi
done

# Also clear any PostgreSQL version directories that might exist
# PostgreSQL 18+ uses version-specific directories like /var/lib/postgresql/18/docker
# We need to clear these even if they don't have PG_VERSION, as PostgreSQL checks for directory existence
if [ -d "/var/lib/postgresql" ]; then
    echo "Checking for PostgreSQL version-specific directories..." >&2
    # Find all version directories (e.g., /var/lib/postgresql/18/docker, /var/lib/postgresql/16/data)
    for version_dir in /var/lib/postgresql/*/docker /var/lib/postgresql/*/data; do
        if [ -d "$version_dir" ]; then
            echo "Found PostgreSQL version directory: $version_dir" >&2
            if [ -f "$version_dir/PG_VERSION" ]; then
                echo "Directory is initialized (PG_VERSION exists). Removing to force reinitialization..." >&2
            else
                echo "Directory exists (even without PG_VERSION). Clearing to ensure init scripts run..." >&2
            fi
            # Clear the directory contents
            find "$version_dir" -mindepth 1 -delete 2>/dev/null || {
                rm -rf "$version_dir"/* "$version_dir"/.[!.]* 2>/dev/null || true
            }
            echo "Cleared $version_dir" >&2
        fi
    done
    # Also check for any numbered version directories directly and clear their subdirectories
    for version_num_dir in /var/lib/postgresql/[0-9]*; do
        if [ -d "$version_num_dir" ]; then
            echo "Found PostgreSQL version number directory: $version_num_dir" >&2
            for subdir in "$version_num_dir"/docker "$version_num_dir"/data; do
                if [ -d "$subdir" ]; then
                    echo "Clearing $subdir (PostgreSQL 18+ may use this location)..." >&2
                    find "$subdir" -mindepth 1 -delete 2>/dev/null || {
                        rm -rf "$subdir"/* "$subdir"/.[!.]* 2>/dev/null || true
                    }
                    echo "Cleared $subdir" >&2
                fi
            done
        fi
    done
fi

echo "=== Calling original PostgreSQL entrypoint ===" >&2

# Call the original postgres entrypoint
exec /usr/local/bin/docker-entrypoint.sh "$@"

