#!/bin/bash
#
# Copyright 2025 coze-dev Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#


# Script for updating user password
# Usage: ./change_user_password.sh <email> [password]
# Parameters:
#   email: User email (required)
#   password: New password (optional, default is 123456)

set -e

# Check parameters
if [ $# -lt 1 ]; then
    echo "Usage: $0 <email> [password]"
    echo "Parameters:"
    echo "  email: User email (required)"
    echo "  password: New password (optional, default is 123456)"
    exit 1
fi

EMAIL="$1"
PASSWORD="${2:-123456}"

# Read MySQL configuration from docker-compose.yml
MYSQL_USER="${MYSQL_USER:-coze}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-coze123}"
MYSQL_DATABASE="${MYSQL_DATABASE:-opencoze}"
MYSQL_CONTAINER="coze-mysql"

echo "Updating password for user $EMAIL..."

# Python script to generate Argon2id hashed password
# Reference implementation from hashPassword function in user_impl.go
PYTHON_SCRIPT=$(cat << 'EOF'
import argon2
import base64
import sys

def hash_password(password):
    # Default Argon2id parameters, consistent with Go code parameters
    memory = 64 * 1024  # 64MB
    iterations = 3
    parallelism = 4
    salt_length = 16
    key_length = 32
    
    # Create Argon2 hasher
    hasher = argon2.PasswordHasher(
        memory_cost=memory,
        time_cost=iterations,
        parallelism=parallelism,
        hash_len=key_length,
        salt_len=salt_length
    )
    
    # Generate hash
    hashed = hasher.hash(password)
    return hashed

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <password>")
        sys.exit(1)
    
    password = sys.argv[1]
    hashed_password = hash_password(password)
    print(hashed_password)
EOF
)

# Check if argon2-cffi is installed
if ! python -c "import argon2" 2>/dev/null; then
    echo "Error: argon2-cffi library is required"
    echo "If your version of python is python2"
    echo "    Please run: pip install argon2"
    echo "If your version of python is python3"
    echo "    Please run: pip install argon2-cffi"
    exit 1
fi

# Generate hashed password
echo "Generating password hash..."
HASHED_PASSWORD=$(echo "$PYTHON_SCRIPT" | python - "$PASSWORD")

if [ -z "$HASHED_PASSWORD" ]; then
    echo "Error: Password hash generation failed"
    exit 1
fi

echo "Password hash generated successfully"

# Check if MySQL container is running
if ! docker ps | grep -q "$MYSQL_CONTAINER"; then
    echo "Error: MySQL container '$MYSQL_CONTAINER' is not running"
    echo "Please start MySQL container first: docker-compose up -d mysql"
    exit 1
fi

# Build SQL update statement
SQL="UPDATE user SET password = '$HASHED_PASSWORD' WHERE email = '$EMAIL';"

echo "Executing SQL update..."

# Execute SQL statement through Docker and capture both stdout and stderr
# Use --verbose flag to get detailed output including row count information
RESULT=$(docker exec -it "$MYSQL_CONTAINER" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" --verbose -e "$SQL" 2>&1)
EXIT_CODE=$?
# Check if command executed successfully
if [ $EXIT_CODE -eq 0 ]; then
    echo "The SQL query executed successfully"
else
    echo "❌ Error: SQL execution failed (exit code: $EXIT_CODE)"
    echo "$RESULT"
    exit 1
fi

echo "Operation completed"