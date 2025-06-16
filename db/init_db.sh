#!/bin/bash

# CONFIGURATION
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="testdb"
DB_USER="postgres"
SQL_DIR="."


# Prompt for password (or use env var or .pgpass for automation)
# read -s -p "Enter password for PostgreSQL user $DB_USER: " PGPASSWORD
# export PGPASSWORD
# echo

# Define the exact order of files (relative to ./)
FILE_ORDER=(
  "./schema.sql"
  "./permissions.sql"
  "./views.sql"
  "./functions" #  folder
  "./data.sql"
)



# Function to execute a single SQL file
execute_file(){
  local filepath="$1"

  echo "                                 "
  echo "================================="
  echo "Running $filepath..."
  echo "================================="
  echo "                                 "
 echo "filepath: $filepath"
   echo "--------------------------------------"
  echo "                                 "

  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$filepath"
  if [ $? -ne 0 ]; then
    echo "Error executing $filepath. Exiting."
    exit 1
  fi

}

# Function to execute SQL files in a directory in alphabatical order
execute_directory(){
  local dir_path="$1"
  echo "                                 "
  echo "======================================"
  echo "*** Processing directory: $dir_path"
  echo "======================================"
  echo "                                 "
    echo "dir_path: $dir_path"
  echo "--------------------------------------"
  echo "                                 "

  # Get all .sql files in the directory, sorted alphabetically
  local sql_files=($(find "$dir_path" -maxdepth 1 -name "*.sql" -type f | sort))

  if [ ${#sql_files[@]} -eq 0 ]; then
    echo "No SQL files found in directory: $dir_path"
    return 0
  fi
  echo "sql_files: ${sql_files[@]}"
  # Execute each SQL file in the directory
  for file_path in "${sql_files[@]}"; do
    execute_file "$file_path"
  done
}


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
  # echo "$full_path"

done

# # Run each file in order
# for filename in "${FILE_ORDER[@]}"; do
#   filepath="$SQL_DIR/$filename"
#   if [[ ! -f "$filepath" ]]; then
#     echo "File not found: $filepath"
#     exit 1
#   fi

#   echo "Running $filepath..."
#   psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$filepath"
#   if [ $? -ne 0 ]; then
#     echo "Error executing $filename. Exiting."
#     exit 1
#   fi
# done

echo "All SQL scripts executed successfully."
# unset PGPASSWORD
