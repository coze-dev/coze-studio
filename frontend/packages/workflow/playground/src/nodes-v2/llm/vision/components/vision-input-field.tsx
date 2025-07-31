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

import { type FC } from 'react';

import {
  type FieldRenderProps,
  type FieldArrayRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import { type InputValueVO, type ViewVariableType } from '@coze-workflow/base';
import { IconCozMinus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { isVisionInput } from '../utils/index';
import { VisionValueField } from './vision-value-field';
import { VisionNameField } from './vision-name-field';

interface VisionInputFieldProps {
  inputField: FieldRenderProps<InputValueVO>['field'];
  inputsField: FieldArrayRenderProps<InputValueVO>['field'];
  index: number;
  readonly?: boolean;
  form;
  enabledTypes: ViewVariableType[];
}

/**
 * input field
 */
export const VisionInputField: FC<VisionInputFieldProps> = ({
  readonly,
  inputField,
  inputsField,
  index,
  enabledTypes,
}) => {
  if (!isVisionInput(inputField?.value)) {
    return null;
  }
  return (
    <div className={'flex items-start pb-1 gap-1'}>
      <VisionNameField
        inputField={inputField}
        inputsField={inputsField}
        enabledTypes={enabledTypes}
      />
      <VisionValueField
        name={`${inputField.name}.input`}
        enabledTypes={enabledTypes}
      />
      {readonly ? (
        <></>
      ) : (
        <div className="leading-none">
          <IconButton
            size="small"
            color="secondary"
            icon={<IconCozMinus className="text-sm" />}
            onClick={() => {
              inputsField.delete(index);
            }}
          />
        </div>
      )}
    </div>
  );
};
