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

import {
  VARIABLE_TYPE_ALIAS_MAP,
  type ViewVariableType,
} from '@coze-workflow/base';

import { OutputsParamDisplay } from '@/form-extensions/components/output-param-display';
import { withField, useField } from '@/form';

export interface OutputsProps {
  id: string;
  name: string;
  settingOnErrorPath?: string;
  topLevelReadonly?: boolean;
  disabledTypes?: ViewVariableType[];
  title?: string;
  tooltip?: React.ReactNode;
  disabled?: boolean;
  customReadonly?: boolean;
  hiddenTypes?: ViewVariableType[];
  noCard?: boolean;
  jsonImport?: boolean;
  allowAppendRootData?: boolean;
  withDescription?: boolean;
  withRequired?: boolean;
}

export const OutputsDisplayField = withField<OutputsProps>(() => {
  const { value } = useField<
    {
      name: string;
      type: string;
      required?: boolean;
    }[]
  >();

  return (
    <OutputsParamDisplay
      options={{
        outputInfo: value?.map(item => ({
          ...item,
          label: item.name ?? '',
          type: VARIABLE_TYPE_ALIAS_MAP[item.type],
        })),
      }}
    />
  );
});
