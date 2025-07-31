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

import { PluginType } from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';
/**
 * Get the version number of the workflow according to the pluginId of the workflow.
 */
export const getWorkflowVersionByPluginId = async ({
  spaceId,
  pluginId,
}: {
  spaceId: string;
  pluginId?: string;
}) => {
  if (!pluginId || pluginId === '0') {
    return;
  }
  const resp = await PluginDevelopApi.GetPlaygroundPluginList(
    {
      space_id: spaceId,
      page: 1,
      size: 1,
      plugin_ids: [pluginId],
      plugin_types: [PluginType.WORKFLOW, PluginType.IMAGEFLOW],
    },
    {
      __disableErrorToast: true,
    },
  );

  // Complete version information
  const versionName = resp.data?.plugin_list?.[0]?.version_name;
  return versionName;
};
