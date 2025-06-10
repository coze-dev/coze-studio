import { type AbilityKey } from '@coze-agent-ide/tool-config';
import { ModelFuncConfigType } from '@coze-arch/bot-api/developer_api';

// AbilityKey 到 ModelFuncConfigType 的映射
const abilityKeyFuncConfigTypeMap: {
  // 确保每个 key 这里都有配置
  [key in AbilityKey]: ModelFuncConfigType | null;
} = {
  plugin: ModelFuncConfigType.Plugin,
  workflow: ModelFuncConfigType.Workflow,
  knowledge: null,
  imageflow: ModelFuncConfigType.ImageFlow,
  variable: ModelFuncConfigType.Variable,
  database: ModelFuncConfigType.Database,
  longTermMemory: ModelFuncConfigType.LongTermMemory,
  fileBox: ModelFuncConfigType.FileBox,
  trigger: ModelFuncConfigType.Trigger,
  onboarding: ModelFuncConfigType.Onboarding,
  suggest: ModelFuncConfigType.Suggestion,
  voice: ModelFuncConfigType.TTS,
  background: ModelFuncConfigType.BackGroundImage,
  document: ModelFuncConfigType.KnowledgeText,
  table: ModelFuncConfigType.KnowledgeTable,
  photo: ModelFuncConfigType.KnowledgePhoto,
  shortcut: ModelFuncConfigType.ShortcutCommand,
  devHooks: ModelFuncConfigType.HookInfo,
  userInput: ModelFuncConfigType.TTS,
};

export const abilityKey2ModelFunctionConfigType = (abilityKey: AbilityKey) =>
  abilityKeyFuncConfigTypeMap[abilityKey];
