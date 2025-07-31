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

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import {
  type ViewVariableTreeNode,
  type SettingOnErrorValue,
} from '@coze-workflow/nodes';

export { SettingOnErrorValue } from '@coze-workflow/nodes';

export interface SettingOnErrorProps extends Partial<SetterComponentProps> {
  value: SettingOnErrorValue;
  onChange: (value: SettingOnErrorValue) => void;
  batchModePath?: string;
  outputsPath?: string;
  noPadding?: boolean;
  isBatch?: boolean;
}

export interface ErrorFormProps extends Pick<SettingOnErrorProps, 'noPadding'> {
  isOpen?: boolean;
  json?: string;
  onSwitchChange: (isOpen: boolean) => void;
  onJSONChange: (json?: string) => void;
  readonly?: boolean;
  errorMsg?: string;
  defaultValue?: string;
  outputs?: ViewVariableTreeNode[];
}

export type ErrorFormPropsV2 = ErrorFormProps &
  Pick<SettingOnErrorProps, 'value' | 'onChange' | 'isBatch'> & {
    syncOutputs?: (isOpen: boolean) => void;
  };

export interface SettingOnErrorItemProps<T> {
  value?: T;
  onChange?: (value?: T) => void;
  readonly?: boolean;
}
