import { type PluginApi } from '@coze-arch/bot-api/developer_api';
import { type PluginInfoProps } from '@coze-studio/plugin-shared';

export const getPluginApiKey = (api: Pick<PluginApi, 'plugin_id' | 'name'>) =>
  (api.plugin_id ?? '0') + (api.name ?? '');

export { getEnv } from './get-env';

export const doFormatTypeAndCreation = (info?: PluginInfoProps) =>
  info ? `${info?.plugin_type}-${info?.creation_method}` : '';
