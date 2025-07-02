import { useEffect } from 'react';

import { useRequest } from 'ahooks';
import { PluginDevelopApi } from '@coze-arch/bot-api';

export const usePluginPermissionManage = ({ botId }: { botId: string }) => {
  const {
    loading,
    error,
    data,
    run: runGetList,
  } = useRequest(
    () => PluginDevelopApi.GetQueriedOAuthPluginList({ bot_id: botId }),
    {
      manual: true,
    },
  );
  const { runAsync: runRevoke } = useRequest(
    pluginId =>
      PluginDevelopApi.RevokeAuthToken({
        plugin_id: pluginId,
        bot_id: botId,
      }),
    {
      manual: true,
      onSuccess: () => {
        runGetList();
      },
    },
  );

  useEffect(() => {
    runGetList();
  }, []);

  return {
    loading,
    error,
    data: data?.oauth_plugin_list ?? [],
    runGetList,
    runRevoke,
  };
};
