#!/bin/sh
set -e

# Parse command-line arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --es-address)
      case "$2" in
        "" | -*) echo "Error: Missing value for $1" >&2; exit 1;;
      esac
      ES_ADDR_ARG="$2"
      shift 2
      ;;
    --index-dir)
      case "$2" in
        "" | -*) echo "Error: Missing value for $1" >&2; exit 1;;
      esac
      INDEX_DIR_ARG="$2"
      shift 2
      ;;
    --docker-host)
      case "$2" in
        "true" | "false") REPLACE_ES_ADDR_WITH_DOCKER_HOST_ARG="$2" ;;
        *) echo "Error: Invalid value for $1. Must be 'true' or 'false'" >&2; exit 1;;
      esac
      shift 2
      ;;
    *)
      # unknown option
      shift
      ;;
  esac
done

# If ES_ADDR_ARG argument is provided, use it. Otherwise, use environment variable or default logic.
if [ -n "$ES_ADDR_ARG" ]; then
  ES_ADDR=$ES_ADDR_ARG
fi

REPLACE_ES_ADDR=${REPLACE_ES_ADDR_WITH_DOCKER_HOST_ARG:-true}
if [ "$REPLACE_ES_ADDR" = "true" ]; then
  case "$ES_ADDR" in
    *localhost*|*"127.0.0.1"*)
      echo "ES_ADDR is localhost, using docker address: http://elasticsearch:9200"
      ES_ADDR="http://elasticsearch:9200"
      ;;
  esac
fi

# If INDEX_DIR_ARG argument is provided, use it. Otherwise, use the default.
if [ -n "$INDEX_DIR_ARG" ]; then
  INDEX_DIR=$INDEX_DIR_ARG
else
  INDEX_DIR=/es_index_schema
fi

echo "ES_ADDR: $ES_ADDR"
echo "INDEX_DIR: $INDEX_DIR"

AUTH_PARAM=""
if [ -n "$ES_USERNAME" ]; then
  AUTH_PARAM="-k -u $ES_USERNAME:$ES_PASSWORD"
fi

for i in $(seq 1 60); do
  echo "Checking Elasticsearch availability... (attempt $i)"
  if curl -s -f $AUTH_PARAM "${ES_ADDR}/_cat/health"; then
    echo "Elasticsearch is up and running!"
    break
  fi
  echo "Elasticsearch not available, retrying in 1 seconds..."
  sleep 1
done

echo -e "🔍 Checking smartcn plugin status..."
if ! curl -s $AUTH_PARAM "${ES_ADDR}/_cat/plugins" | grep -q "analysis-smartcn"; then
  echo -e "❌ smartcn plugin not loaded correctly, please ensure the plugin is installed and Elasticsearch is restarted"
  exit 1
fi

echo -e "🔍 Initializing Elasticsearch index templates..."
ES_TEMPLATES=$(find "$INDEX_DIR" -type f -name "*.index-template.json" | sort)
if [ -z "$ES_TEMPLATES" ]; then
  echo -e "ℹ️ No Elasticsearch index templates found in $INDEX_DIR"
  exit 1
else
  # Add index creation logic
  for template_file in $ES_TEMPLATES; do
    template_name=$(basename "$template_file" | sed 's/\.index-template\.json$//')
    # Check if index template exists
    if curl -s -f $AUTH_PARAM -I "${ES_ADDR}/_index_template/$template_name" >/dev/null; then
      echo -e "ℹ️ Index template $template_name already exists"
    else
      echo -e "➡️ Registering template: $template_name"

      # Attempt to register index template
      response=$(curl -s $AUTH_PARAM -X PUT "${ES_ADDR}/_index_template/$template_name" \
        -H "Content-Type: application/json" \
        -d @"$template_file" 2>&1)

      # Check if successful
      if echo "$response" | grep -q '"acknowledged":true'; then
        echo -e "✅ Template $template_name registered successfully"
      else
        echo -e "❌ Failed to register template $template_name. Response: $response"
        exit 1
      fi
    fi

    index_name=$(basename "$template_file" | sed 's/\.index-template\.json$//')
    # Check if index exists
    if ! curl -s -f $AUTH_PARAM "${ES_ADDR}/_cat/indices/$index_name" >/dev/null; then
      echo -e "➡️ Creating index: $index_name"
      # Create index (matching template's index_patterns)
      curl $AUTH_PARAM -X PUT "${ES_ADDR}/$index_name" -H "Content-Type: application/json"
      echo ""

      # Set refresh interval if index was just created
      echo -e "🔄 Setting refresh_interval for index: $index_name..."
      CURL_OUTPUT=$(curl -s $AUTH_PARAM -w "\nHTTP_STATUS_CODE:%{http_code}" -X PUT "${ES_ADDR}/${index_name}/_settings" -H 'Content-Type: application/json' -d'
          {
            "index": {
              "refresh_interval": "10ms"
            }
          }')
      echo -e "📄 Curl command output for $index_name:\n$CURL_OUTPUT"
      # Extract the JSON body from the output, excluding the HTTP_STATUS_CODE line
      JSON_BODY=$(echo "$CURL_OUTPUT" | sed '$d')
      if ! echo "$JSON_BODY" | grep -q '"acknowledged":true'; then
        echo -e "⚠️ Warning: Failed to set refresh interval for $index_name index. Response Body: $JSON_BODY. Please check and set manually."
        exit 1
      else
        echo -e "✅ Successfully set refresh_interval for $index_name."
      fi
    else
      echo -e "ℹ️ Index $index_name already exists"
    fi
  done
fi

echo "Elasticsearch setup completed."
exit 0