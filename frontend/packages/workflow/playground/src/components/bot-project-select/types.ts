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

//Backend undefined, derived from workflow_info profile_memory in bot_info
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
