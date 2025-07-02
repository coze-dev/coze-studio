import type React from 'react';

import { type ValueExpression } from '@coze-workflow/variable';
import { type RoleType } from '@coze-arch/idl/social_api';

export interface RoleInformation {
  /** 场景下角色的唯一id */
  biz_role_id: string;
  /** 角色名 */
  role: string;
  /** 角色昵称 */
  nickname?: string;
  /** 角色类型 */
  role_type: RoleType;
  /** 角色描述 */
  description?: string;
}

export interface RoleSetting {
  biz_role_id: string;
  role: string;
  nickname?: string;
}

export interface NicknameVariableSetting {
  biz_role_id: '';
  role: '';
  nickname: string;
}

export type UserSettings = RoleSetting[] | NicknameVariableSetting[];

export interface MessageVisibilityValue {
  visibility?: string;
  user_settings?: UserSettings;
}

export interface RenderSelectOptionParams {
  className?: string;
  disabled?: boolean;
  focused?: boolean;
  selected?: boolean;
  inputValue?: string;
  label: string;
  value: string;
  onClick: (e: React.MouseEvent) => void;
}

export interface NicknameVariable {
  name: string;
  input?: ValueExpression;
}

export type NicknameVariables = Array<NicknameVariable>;
export interface MessageVisibilitySetterOptions {
  nicknameVariables: NicknameVariables;
}

export type RoleSelectHandler = (value: UserSettings) => void;
