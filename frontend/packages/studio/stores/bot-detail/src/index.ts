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

export { avatarBackgroundWebSocket } from './utils/avatar-background-socket';

export { useBotDetailIsReadonly } from './hooks/use-bot-detail-readonly';
export {
  TTSInfo,
  type VariableItem,
  VariableKeyErrType,
  type TableMemoryItem,
  type SuggestQuestionMessage,
  type BotDetailSkill,
  type WorkFlowItemType,
  type DatabaseInfo,
  type DatabaseList,
  type KnowledgeConfig,
  type TagListType,
  type ExtendOnboardingContent,
  TimeCapsuleOptionsEnum,
} from './types/skill';

export { updateHeaderStatus } from './utils/handle-status';
export { initBotDetailStore } from './init/init-bot-detail-store';
export { useBotDetailStoreSet } from './store/index';

export {
  autosaveManager,
  personaSaveManager,
  botSkillSaveManager,
  multiAgentSaveManager,
  registerMultiAgentConfig,
  getBotDetailDtoInfo,
  saveConnectorType,
  saveDeleteAgents,
  saveUpdateAgents,
  saveMultiAgentData,
  saveFileboxMode,
  saveTableMemory,
  saveTTSConfig,
  saveTimeCapsule,
  saveDevHooksConfig,
  updateShortcutSort,
  updateBotRequest,
} from './save-manager';
export { getBotDetailIsReadonly } from './utils/get-read-only';
export { uniqMemoryList } from './utils/uniq-memory-list';

export { verifyBracesAndToast } from './utils/submit';
export { storage } from './utils/storage';

export { findTargetAgent, findFirstAgentId } from './utils/find-agent';
export { manuallySwitchAgent, deleteAgent } from './utils/handle-agent';
export { type Agent, type BotMultiAgent, type DraftBotVo } from './types/agent';
export { getReplacedBotPrompt } from './utils/save';
export { getExecuteDraftBotRequestId } from './utils/execute-draft-bot-request-id';
export { useManuallySwitchAgentStore } from './store/manually-switch-agent-store';
export { useChatBackgroundState } from './hooks/use-chat-background-state';

export {
  DotStatus,
  GenerateAvatarModal,
  GenerateType,
} from './types/generate-image';
export { useGenerateImageStore } from './store/generate-image-store';
export { initGenerateImageStore } from './init/init-generate-image';
export { useMonetizeConfigStore } from './store/monetize-config-store';
