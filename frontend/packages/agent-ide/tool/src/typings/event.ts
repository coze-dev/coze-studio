import {
  type AgentModalTabKey,
  type AbilityKey,
} from '@coze-agent-ide/tool-config';

export interface IAbilityInitialedEventParams {
  initialedAbilityKeyList: Array<AbilityKey>;
}

export interface IToggleContentBlockEventParams {
  abilityKey: AbilityKey;
  isExpand: boolean;
}

export interface IAgentModalTabChangeEventParams {
  tabKey: AgentModalTabKey;
}

export interface IAgentModalVisibleChangeEventParams {
  isVisible: boolean;
}
