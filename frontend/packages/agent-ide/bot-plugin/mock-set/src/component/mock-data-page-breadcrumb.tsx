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

  // 插件详情
  const [pluginInfo, setPluginInfo] = useState<PluginMetaInfo>({
    name: routeResponse?.pluginName,
  });

  // 获取当前 plugin 信息
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
