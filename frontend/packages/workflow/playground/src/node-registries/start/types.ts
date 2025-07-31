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

import { type TriggerForm } from '@coze-workflow/nodes';
import {
  type ViewVariableMeta,
  type VariableMetaDTO,
  type NodeDataDTO as BaseNodeDataDTO,
} from '@coze-workflow/base';
export type FormData = {
  outputs: Array<ViewVariableMeta & { isPreset?: boolean; enabled?: boolean }>;
  inputs?: {
    auto_save_history: boolean;
  };
  [TriggerForm.TabName]?: string;
} & Pick<BaseNodeDataDTO, 'nodeMeta'>;

export type NodeDataDTO = {
  trigger_parameters?: VariableMetaDTO[];
  inputs?: {
    auto_save_history: boolean;
  };
} & Pick<BaseNodeDataDTO, 'outputs' | 'nodeMeta'>;
