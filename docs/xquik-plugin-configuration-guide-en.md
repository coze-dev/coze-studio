# Xquik plugin configuration

The Xquik plugin gives agents read-only access to public X data. It can search posts, retrieve one post, and retrieve one profile.

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.

## Prerequisites

- A self-hosted Coze Studio deployment
- An Xquik API key from [the Xquik dashboard](https://dashboard.xquik.com)

The API key is shared by every user of this Coze Studio deployment. Use a dedicated key and monitor its usage.

## Configure the API key

1. Open `backend/conf/plugin/pluginproduct/plugin_meta.yaml`.
2. Find the entry with `plugin_id: 24`.
3. Set `service_token` inside its authentication payload:

   ```yaml
   payload: '{"key": "x-api-key", "service_token": "YOUR_XQUIK_API_KEY", "location": "Header"}'
   ```

4. Restart `coze-server` so it reloads the plugin catalog.
5. Open **Explore > Plugins > Xquik**.

Never commit the configured key. Rotate it immediately if it appears in logs or version control.

## Available tools

| Tool | Use |
| --- | --- |
| `search_x_posts` | Search public X posts with date, author, language, media, and engagement filters. |
| `get_x_post` | Retrieve one public post with author, media, and engagement fields. |
| `get_x_user` | Retrieve one public profile with audience and verification fields. |

The plugin exposes no write actions, account sessions, or private data.

## Test the plugin

Add `search_x_posts` to an agent or workflow. Ask it to find recent posts about a topic. If authentication fails, confirm the payload key is `x-api-key` and restart `coze-server`.

See the [Xquik REST API documentation](https://docs.xquik.com/api-reference/x/search-tweets) for search behavior and pagination.
