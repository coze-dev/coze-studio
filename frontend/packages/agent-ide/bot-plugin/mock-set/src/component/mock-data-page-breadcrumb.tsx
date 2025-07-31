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

import { useEffect, useState } from 'react';

import { UIBreadcrumb } from '@coze-studio/components';
import { logger } from '@coze-arch/logger';
import { UILayout } from '@coze-arch/bot-semi';
import { usePageJumpResponse, PageType } from '@coze-arch/bot-hooks';
import {
  type PluginMetaInfo,
  type PluginAPIInfo,
} from '@coze-arch/bot-api/developer_api';
import { type MockSet } from '@coze-arch/bot-api/debugger_api';
import { DeveloperApi } from '@coze-arch/bot-api';

import s from './index.module.less';

interface MockSetPageBreadcrumbProps {
  pluginId?: string;
  apiInfo?: PluginAPIInfo;
  mockSetInfo?: MockSet;
}

export function MockSetPageBreadcrumb({
  pluginId,
  apiInfo,
  mockSetInfo,
}: MockSetPageBreadcrumbProps) {
  const routeResponse = usePageJumpResponse(PageType.PLUGIN_MOCK_DATA);

  // plugin details
  const [pluginInfo, setPluginInfo] = useState<PluginMetaInfo>({
    name: routeResponse?.pluginName,
  });

  // Get current plugin information
  const getPluginInfo = async () => {
    try {
      const res = await DeveloperApi.GetPluginInfo(
        {
          plugin_id: pluginId || '',
        },
        { __disableErrorToast: true },
      );
      if (res?.code === 0) {
        setPluginInfo(res.meta_info || {});
      }
    } catch (error) {
      // @ts-expect-error -- linter-disable-autofix
      logger.error({ error, eventName: 'get_plugin_info_fail' });
    }
  };

  useEffect(() => {
    getPluginInfo();
  }, [pluginId]);

  return (
    <UILayout.Header
      className={s['layout-header']}
      breadcrumb={
        <UIBreadcrumb
          showTooltip={{ width: '300px' }}
          pluginInfo={pluginInfo}
          pluginToolInfo={apiInfo}
          mockSetInfo={mockSetInfo}
          compact={false}
        />
      }
    />
  );
}
