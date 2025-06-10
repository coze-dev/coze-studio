import { PluginType } from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';
/**
 * 根据 workflow 的 pluginId 获取 workflow 的版本号
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

  // 补全版本信息
  const versionName = resp.data?.plugin_list?.[0]?.version_name;
  return versionName;
};
