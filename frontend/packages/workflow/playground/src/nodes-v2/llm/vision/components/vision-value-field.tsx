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
  Field,
  type FieldRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import { type ValueExpression, ViewVariableType } from '@coze-workflow/base';

import { ValueExpressionInput } from '@/nodes-v2/components/value-expression-input';
import { FormItemFeedback } from '@/nodes-v2/components/form-item-feedback';

import { DEFUALT_VISION_INPUT } from '../constants';

interface VisionProps {
  name: string;
  enabledTypes: ViewVariableType[];
}

/**
 * input value field
 * @returns */
export const VisionValueField: FC<VisionProps> = ({ enabledTypes, name }) => {
  const disabledTypes = ViewVariableType.getComplement([
    ...enabledTypes,
    ViewVariableType.String,
  ]);

  return (
    <Field name={name}>
      {({
        field: childInputField,
        fieldState: inputFieldState,
      }: FieldRenderProps<ValueExpression | undefined>) => (
        <div className="flex-[3] min-w-0">
          <ValueExpressionInput
            {...childInputField}
            isError={!!inputFieldState?.errors?.length}
            disabledTypes={disabledTypes}
            defaultInputType={enabledTypes[0]}
            inputTypes={enabledTypes}
            onChange={v => {
              const expression = v as ValueExpression;
              if (!expression) {
                // The default value needs to be accompanied by raw meta, otherwise it is impossible to distinguish whether it is visual understanding or not.
                childInputField?.onChange(DEFUALT_VISION_INPUT);
                return;
              }
              const newExpression: ValueExpression = {
                ...expression,
                rawMeta: {
                  ...(expression.rawMeta || {}),
                  isVision: true,
                },
              };
              childInputField?.onChange(newExpression);
            }}
          />
          <FormItemFeedback errors={inputFieldState?.errors} />
        </div>
      )}
    </Field>
  );
};
