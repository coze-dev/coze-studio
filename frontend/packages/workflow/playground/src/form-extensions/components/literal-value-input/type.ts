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

import { type CSSProperties } from 'react';

import { type SchemaObject } from 'ajv';
import {
  type LiteralExpression,
  type ViewVariableType,
} from '@coze-workflow/base';
import { type SelectProps } from '@coze-arch/coze-design';

export type LiteralValueType = LiteralExpression['content'] | null;
export type InputType = ViewVariableType;
export interface InputComponentRegistry {
  canHandle:
    | InputType
    | ((
        inputType: InputType,
        // dropdown box option list
        optionsList?: { label: string; value: string }[],
      ) => boolean);
  component: React.FC<LiteralValueInputProps>;
}
export interface LiteralValueInputProps {
  testId?: string;
  className?: string;
  defaultValue?: LiteralValueType;
  value?: LiteralValueType;
  inputType: InputType;
  readonly?: boolean;
  disabled?: boolean;
  onChange?: (value?: LiteralValueType) => void;
  onBlur?: (value?: LiteralValueType) => void;
  onFocus?: () => void;
  validateStatus?: SelectProps['validateStatus'];
  config?: {
    min?: number;
    max?: number;
    jsonSchema?: SchemaObject;
    // Drop-down box option list, according to this field to determine whether it needs to be rendered as a drop-down box
    optionsList?: { label: string; value: string }[];
    onRequestInputExpand?: (expand: boolean) => void;
  };
  placeholder?: string;
  style?: CSSProperties;
  componentRegistry?: InputComponentRegistry[];
}
