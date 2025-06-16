#!/bin/bash

# HARDCODED CONFIGURATION - REPLACE WITH YOUR ACTUAL VALUES
# ⚠️  WARNING: This contains sensitive data - DO NOT commit to version control!

# === SUPABASE CONFIGURATION ===
DB_HOST="aws-0-us-west-1.pooler.supabase.com"  # Replace with your Supabase host
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres.rgyytblnmsgnvreuaybu"     # Replace with your actual user
DB_PASSWORD="Supabase2008!"      # Replace with your actual password
SSL_MODE="require"
SSL_ROOT_CERT="/Users/aa/Downloads/prod-ca-2021.crt"  # Optional: "/path/to/prod-supabase.cer"



# psql "sslmode=verify-full sslrootcert=/Users/aa/Downloads/prod-ca-2021.crt host=aws-0-us-west-1.pooler.supabase.com dbname=postgres user=postgres.rgyytblnmsgnvreuaybu:Supabase2008!"

# "postgresql://postgres.rgyytblnmsgnvreuaybu:Supabase2008!@aws-0-us-west-1.pooler.supabase.com:5432/postgres"


# === OR LOCAL POSTGRESQL (comment out Supabase above, uncomment below) ===
# DB_HOST="localhost"
# DB_PORT="5432" 
# DB_NAME="testdb"
# DB_USER="postgres"
# DB_PASSWORD="your-local-password"
# SSL_MODE="disable"
# SSL_ROOT_CERT=""

SQL_DIR="."

# Build PostgreSQL connection string
if [[ -n "$SSL_ROOT_CERT" && "$SSL_ROOT_CERT" != "" ]]; then
    CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=${SSL_MODE}&sslrootcert=${SSL_ROOT_CERT}"
else
    CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=${SSL_MODE}"
fi

# Define the exact order of files and directories
FILE_ORDER=(
  "./schema.sql"
  "./permissions.sql"
  "./views.sql"
  "./functions"
  "./data.sql"
)

# Function to execute a single SQL file
execute_file() {
    local filepath="$1"
    
    echo ""
    echo "================================="
    echo "Running $filepath..."
    echo "================================="
    
    psql "$CONNECTION_STRING" -f "$filepath"
    if [ $? -ne 0 ]; then
        echo "Error executing $filepath. Exiting."
        exit 1
    fi
}

# Function to execute SQL files in a directory in alphabetical order
execute_directory() {
    local dir_path="$1"
    
    echo ""
    echo "======================================"
    echo "*** Processing directory: $dir_path"
    echo "======================================"
    
    # Get all .sql files in the directory, sorted alphabetically
    local sql_files=($(find "$dir_path" -maxdepth 1 -name "*.sql" -type f | sort))
    
    if [ ${#sql_files[@]} -eq 0 ]; then
        echo "No SQL files found in directory: $dir_path"
        return 0
    fi
    
    echo "Found ${#sql_files[@]} SQL files:"
    for file in "${sql_files[@]}"; do
        echo "  - $file"
    done
    
    # Execute each SQL file in the directory
    for filepath in "${sql_files[@]}"; do
        execute_file "$filepath"
    done
}

# Main execution starts here
echo "SQL Database Deployment Script (Local Version)"
echo "==============================================="
echo "Connecting to: $DB_HOST"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Process each entry in the file order
for entry in "${FILE_ORDER[@]}"; do
    full_path="$SQL_DIR/$entry"
    
    # Remove any double slashes that might occur
    full_path=$(echo "$full_path" | sed 's|//|/|g' | sed 's|\./\./|./|g')
    
    if [[ -f "$full_path" ]]; then
        execute_file "$full_path"
    elif [[ -d "$full_path" ]]; then
        execute_directory "$full_path"
    else
        echo "Path not found: $full_path"
        exit 1
    fi
done

echo ""
echo "🎉 All SQL scripts executed successfully!"
echo "Database deployment completed."