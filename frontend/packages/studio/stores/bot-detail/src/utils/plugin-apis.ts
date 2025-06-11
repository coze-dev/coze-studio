import { omit } from 'lodash-es';
import type { PluginApi } from '@coze-arch/bot-api/playground_api';

import { type EnabledPluginApi } from '../types/skill';

// 过滤 debug_example 字段 以免超出模型解析长度
export const getPluginApisFilterExample = (
  pluginApis: PluginApi[],
): EnabledPluginApi[] => pluginApis.map(item => omit(item, 'debug_example'));

export const getSinglePluginApiFilterExample = (
  tool: PluginApi,
): EnabledPluginApi => omit(tool, 'debug_example');
