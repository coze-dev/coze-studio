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

/**
 * Types, constants, functions, hooks, components, etc. exposed by START for a long time
 */
export {
  AbilityScope,
  ToolKey,
  AgentSkillKey,
} from '@coze-agent-ide/tool-config';

export {
  useToolStore,
  useToolStoreAction,
  useToolDispatch,
  useSubscribeToolStore,
} from './hooks/public/store/use-tool-store';

export { openBlockEventToToolKey } from './constants/tool-content-block';

export { useToolContentBlockDefaultExpand } from './hooks/public/collapse/use-tool-content-block-default-expand';
export { useAgentSkillModal } from './hooks/agent-skill-modal/use-agent-skill-modal';
export { useToolToggleCollapse } from './hooks/public/collapse/use-tool-toggle-collapse';
export { useInit } from './hooks/public/init/use-init';
export { useRegisteredToolKeyConfigList } from './hooks/builtin/use-register-tool-key';
export { useIsAllToolHidden } from './hooks/public/container/use-tool-all-hidden';
export { useToolValidData } from './hooks/public/container/use-tool-valid-data';

export { ToolContentBlock } from './components/tool-content-block';
export { AbilityAreaContextProvider } from './context/ability-area-context';
export { ToolView } from './components/tool-view';
export { ToolContainer } from './components/tool-container';
export { ToolMenu } from './components/tool-menu';
export { GroupingContainer } from './components/grouping-container';
export { AbilityAreaContainer } from './components/ability-area-container';

export { ToolEntryCommonProps } from './typings/index';

export { ToolItemList } from './components/tool-item-list';
export { ToolItem } from './components/tool-item';
export { ToolItemSwitch } from './components/tool-item-switch';
export { ToolItemAction } from './components/tool-item-action';
export { ToolItemActionCard } from './components/tool-item-action/actions/tool-item-action-card';
export { ToolItemActionCopy } from './components/tool-item-action/actions/tool-item-action-copy';
export { ToolItemActionDelete } from './components/tool-item-action/actions/tool-item-action-delete';
export { ToolItemActionInfo } from './components/tool-item-action/actions/tool-item-action-info';
export { ToolItemActionSetting } from './components/tool-item-action/actions/tool-item-action-setting';
export { ToolItemActionEdit } from './components/tool-item-action/actions/tool-item-action-edit';
export { ToolItemActionDrag } from './components/tool-item-action/actions/tool-item-action-drag';
export { ToolItemIconInfo } from './components/tool-item-icon/icons/tool-item-icon-info';
export { ToolItemIconPeople } from './components/tool-item-icon/icons/tool-item-icon-people';
export { ToolItemIconCard } from './components/tool-item-icon/icons/tool-item-icon-card';
export { useToolItemContext } from './context/tool-item-context';
export { AutoGenerateButton } from './components/auto-generate-button';
export { AddButton } from './components/add-button';
export { TipsDisplay as ModelCapabilityTipsDisplay } from './components/model-capability-tips';

export { abilityKey2ModelFunctionConfigType } from './utils/model-function-config-type-mapping';

/**
 * END exposes types, constants, functions, hooks, components, etc. for a long time
 */

/**
 * Types, constants, functions, hooks, components, etc. exposed during the START transition period
 */
export {
  /**
   * module primary key
   * @Deprecated This usage is deprecated, please use: 'import {ToolKey} from' @code-agent-ide/tool-config ';
   */
  SkillKeyEnum,
} from '@coze-agent-ide/tool-config';

export { useHasAgentSkillWithPK } from './hooks/agent-skill/use-agent-skill';

export { useEvent } from './hooks/event/use-event';

export { EventCenterEventName } from './typings/scoped-events';
export { IToggleContentBlockEventParams } from './typings/event';
/**
 * Types, constants, functions, hooks, components, etc. exposed during the END transition period
 */
