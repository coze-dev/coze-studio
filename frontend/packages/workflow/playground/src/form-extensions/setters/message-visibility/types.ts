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

import type React from 'react';

import { type ValueExpression } from '@coze-workflow/variable';
import { type RoleType } from '@coze-arch/idl/social_api';

export interface RoleInformation {
  /** The unique ID of the character in the scene. */
  biz_role_id: string;
  /** character name */
  role: string;
  /** character nickname */
  nickname?: string;
  /** character type */
  role_type: RoleType;
  /** Role Description */
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
