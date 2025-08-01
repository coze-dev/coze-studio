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

import { useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useMemoizedFn, useRequest } from 'ahooks';
import { logger } from '@coze-arch/logger';
import { OAuthStatus } from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import { usePluginStore } from '@coze-studio/bot-plugin-store';

const useAuthForApiTool = () => {
  const { pluginInfo, canEdit } = usePluginStore(
    useShallow(store => ({
      pluginInfo: store.pluginInfo,
      canEdit: store.canEdit,
    })),
  );

  const { data, refresh } = useRequest(
    async () =>
      await PluginDevelopApi.GetOAuthStatus({
        plugin_id: pluginInfo?.plugin_id || '',
      }),
    {
      refreshDeps: [pluginInfo],
      ready: pluginInfo?.plugin_id !== undefined && canEdit,
      refreshOnWindowFocus: !0,
    },
  );

  const { run, loading: isUpdateLoading } = useRequest(
    async () => {
      try {
        await PluginDevelopApi.RevokeAuthToken({
          plugin_id: (pluginInfo?.plugin_id as string) || '',
        });

        refresh();
      } catch (error) {
        // @ts-expect-error -- linter-disable-autofix
        logger.error(error);
      }
    },
    { manual: !0, ready: canEdit },
  );

  const needAuth = useMemo(() => data?.is_oauth, [data]);

  const isHasAuth = useMemo(
    () => data?.status === OAuthStatus.Authorized,
    [data],
  );

  const content = useMemo(() => data?.content, [data]);

  const doCancelOauth = useMemoizedFn(async () => {
    await run();
  });

  const doOauth = useMemoizedFn(() => {
    window.open(content, '_blank');
  });

  return {
    canEdit,
    needAuth, // Requires auth authorization
    isHasAuth, // Has the authorization been completed?
    doCancelOauth,
    isUpdateLoading,
    doOauth,
  };
};

export { useAuthForApiTool };
