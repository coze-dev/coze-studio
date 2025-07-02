import { type AbilityScope } from '@coze-agent-ide/tool-config';
import { type BotDetailSkill } from '@coze-studio/bot-detail-store';

type BotSkillType = BotDetailSkill;

export interface IAbilityStoreState {
  [AbilityScope.TOOL]?: BotSkillType;
  [AbilityScope.AGENT_SKILL]?: BotDetailSkill;
}
