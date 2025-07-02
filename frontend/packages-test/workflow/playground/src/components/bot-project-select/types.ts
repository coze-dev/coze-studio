//后端无定义 根据 bot_info 中的 workflow_info.profile_memory 推导而来
import { type IntelligenceType } from '@coze-arch/idl/intelligence_api';

export interface Variable {
  key: string;
  description?: string;
  default_value?: string;
}

export interface IBotSelectOption {
  name: string;
  avatar: string;
  value: string;
  type: IntelligenceType;
}

export interface ValueType {
  id?: string;
  type?: IntelligenceType;
}

export type IBotSelectOptions = IBotSelectOption[];

export interface DisableExtraOptions {
  disableBot?: boolean;
  disableProject?: boolean;
  disableBotTooltip?: string;
  disableProjectTooltip?: string;
}
