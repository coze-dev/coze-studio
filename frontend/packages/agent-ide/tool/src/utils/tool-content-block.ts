import {
  type ToolKey,
  TOOL_KEY_TO_API_STATUS_KEY_MAP,
  type AbilityKey,
  type SkillKeyEnum,
} from '@coze-agent-ide/tool-config';

/**
 * `能力模块主键` 转 `接口定义的属性名` 函数
 * ⚠️ 命名需参看 @/services/auto-generate/developer_api/namespaces/developer_api > TabDisplayItems
 */
export const toolKeyToApiStatusKeyTransformer = (
  $key: AbilityKey | SkillKeyEnum,
) => {
  const apiStatusKey = TOOL_KEY_TO_API_STATUS_KEY_MAP[$key as ToolKey];
  return apiStatusKey ?? `${$key}_tab_status`;
};
