#!/bin/bash
set -e

# Force output to stderr so it shows up in logs even if stdout is buffered
exec 1>&2

echo "=== Custom Chinook entrypoint: Starting ===" >&2

# Determine PGDATA location (defaults to /var/lib/postgresql/data, but can be overridden)
PGDATA="${PGDATA:-/var/lib/postgresql/data}"
echo "Checking for existing database at ${PGDATA}..." >&2

# PostgreSQL 18+ uses version-specific directories like /var/lib/postgresql/18/docker
# We need to clear these BEFORE PostgreSQL's entrypoint runs
# List of all possible PostgreSQL data directory locations
declare -a pg_dirs=(
    "${PGDATA}"
    "/var/lib/postgresql/data"
    "/var/lib/postgresql/18/docker"
    "/var/lib/postgresql/16/data"
)

# Also check for any version-specific directories that might exist
if [ -d "/var/lib/postgresql" ]; then
    for version_dir in /var/lib/postgresql/[0-9]*/docker /var/lib/postgresql/[0-9]*/data; do
        if [ -d "$(dirname "$version_dir")" ]; then
            pg_dirs+=("$version_dir")
        fi
    done
fi

# Clear all found directories
for dir in "${pg_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "Found potential data directory: $dir" >&2
        # Remove data directory contents regardless of initialization status
        # PostgreSQL checks for directory existence, not just PG_VERSION
        if [ -f "$dir/PG_VERSION" ]; then
            echo "WARNING: Found initialized PostgreSQL data (PG_VERSION exists in $dir)" >&2
        elif [ "$(ls -A "$dir" 2>/dev/null)" ]; then
            echo "WARNING: Data directory $dir exists with contents but no PG_VERSION" >&2
        else
            echo "Data directory $dir exists but is empty" >&2
        fi
        echo "Removing contents to force reinitialization and ensure init scripts run..." >&2
        
        # Remove all files and directories
        find "$dir" -mindepth 1 -delete 2>/dev/null || {
            # Fallback: try rm -rf if find fails
            echo "Using fallback removal method for $dir..." >&2
            rm -rf "$dir"/* "$dir"/.[!.]* 2>/dev/null || true
        }
        
        echo "Data directory $dir cleared." >&2
    fi
done

# Also clear any PostgreSQL version directories that might exist
# PostgreSQL 18+ uses version-specific directories like /var/lib/postgresql/18/docker
# We need to clear these even if they don't have PG_VERSION, as PostgreSQL checks for directory existence
if [ -d "/var/lib/postgresql" ]; then
    echo "Checking for PostgreSQL version-specific directories..." >&2
    # Explicitly check for common PostgreSQL 18+ directory patterns
    # PostgreSQL 18 uses /var/lib/postgresql/18/docker by default
    for version in 18 17 16 15 14 13 12 11; do
        for subdir in docker data; do
            version_dir="/var/lib/postgresql/${version}/${subdir}"
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
    done
    # Also use glob patterns as fallback for any other version numbers
    for version_dir in /var/lib/postgresql/*/docker /var/lib/postgresql/*/data; do
        if [ -d "$version_dir" ]; then
            echo "Found PostgreSQL version directory (via glob): $version_dir" >&2
            find "$version_dir" -mindepth 1 -delete 2>/dev/null || {
                rm -rf "$version_dir"/* "$version_dir"/.[!.]* 2>/dev/null || true
            }
            echo "Cleared $version_dir" >&2
        fi
    done
fi

echo "=== Calling original PostgreSQL entrypoint ===" >&2

# Call the original postgres entrypoint
exec /usr/local/bin/docker-entrypoint.sh "$@"

