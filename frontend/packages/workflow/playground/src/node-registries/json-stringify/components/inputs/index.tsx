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
  FieldArray,
  type FieldArrayRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import type { ViewVariableType, InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { ValueExpressionInputField } from '@/node-registries/common/fields';
import { FieldArrayItem, FieldRows, Section, type FieldProps } from '@/form';

interface InputsFieldProps extends FieldProps<InputValueVO[]> {
  title?: string;
  paramsTitle?: string;
  expressionTitle?: string;
  disabledTypes?: ViewVariableType[];
  onAppend?: () => InputValueVO;
  inputPlaceholder?: string;
  literalDisabled?: boolean;
  showEmptyText?: boolean;
  nthCannotDeleted?: number;
}

export const InputsField = ({
  name,
  defaultValue,
  title,
  tooltip,
  disabledTypes,
  inputPlaceholder,
  literalDisabled,
  showEmptyText = true,
}: InputsFieldProps) => {
  const readonly = useReadonly();
  return (
    <FieldArray<InputValueVO> name={name} defaultValue={defaultValue}>
      {({ field }: FieldArrayRenderProps<InputValueVO>) => {
        const { value = [] } = field;
        const length = value?.length ?? 0;
        const isEmpty = !length;
        return (
          <Section
            title={title}
            tooltip={tooltip}
            isEmpty={showEmptyText && isEmpty}
            emptyText={I18n.t('workflow_inputs_empty')}
          >
            <FieldRows>
              {field.map((item, index) => (
                <FieldArrayItem key={item.key} disableRemove hiddenRemove>
                  <div style={{ flex: 3 }}>
                    <ValueExpressionInputField
                      name={`${name}.${index}.input`}
                      disabledTypes={disabledTypes}
                      readonly={readonly}
                      inputPlaceholder={inputPlaceholder}
                      literalDisabled={literalDisabled}
                    />
                  </div>
                </FieldArrayItem>
              ))}
            </FieldRows>
          </Section>
        );
      }}
    </FieldArray>
  );
};
