export const unlockByFetch = (pluginId: string) =>
  fetch('/api/plugin_api/unlock_plugin_edit', {
    keepalive: true,
    method: 'POST',
    body: JSON.stringify({
      plugin_id: pluginId,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
