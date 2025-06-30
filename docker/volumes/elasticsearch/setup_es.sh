#!/bin/sh

if [[ "$ES_ADDR" == *"localhost"* || "$ES_ADDR" == *"127.0.0.1"* ]]; then
  echo "ES_ADDR is localhost, using docker address: http://elasticsearch:9200"
  ES_ADDR="http://elasticsearch:9200"
fi

echo "ES_ADDR: $ES_ADDR"

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
ES_TEMPLATES=$(find "/es_index_schema" -type f -name "*.index-template.json" | sort)
if [ -z "$ES_TEMPLATES" ]; then
  echo -e "ℹ️ No Elasticsearch index templates found in $SCRIPT_DIR/es_index_schema"
else
  # Add index creation logic
  echo -e "🔄 Creating Elasticsearch indexes..."
  for template_file in $ES_TEMPLATES; do

    template_name=$(basename "$template_file" | sed 's/\.index-template\.json$//')
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

    index_name=$(basename "$template_file" | sed 's/\.index-template\.json$//')
    echo -e "➡️ Creating index: $index_name"

    # Check if index exists
    if ! curl -s -f $AUTH_PARAM "${ES_ADDR}/_cat/indices/$index_name" >/dev/null; then
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
