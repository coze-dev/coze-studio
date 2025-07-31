/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
