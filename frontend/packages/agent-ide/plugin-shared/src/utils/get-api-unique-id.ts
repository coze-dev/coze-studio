import { type PluginApi } from '@coze-arch/bot-api/developer_api';

export const getApiUniqueId = ({
  apiInfo,
}: {
  apiInfo?: Pick<PluginApi, 'plugin_id' | 'name'>;
}): string =>
  apiInfo?.name && apiInfo?.plugin_id
    ? `${apiInfo.name}_${apiInfo.plugin_id}`
    : '';
