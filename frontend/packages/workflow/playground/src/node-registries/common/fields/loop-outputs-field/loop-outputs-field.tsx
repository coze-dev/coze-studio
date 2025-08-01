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
import { type InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { NodeInputNameField } from '@/node-registries/common/fields/inputs-parameters-field/node-input-name';
import { ColumnsTitleWithAction } from '@/form-extensions/components/columns-title-with-action';
import {
  AddButton,
  FieldArrayItem,
  FieldRows,
  Section,
  type FieldProps,
} from '@/form';

import { type NodeInputNameProps } from '../inputs-parameters-field/node-input-name/type';
import { LoopOutputSelectField } from './loop-output-select-field';

interface LoopOutputsFieldProps extends FieldProps<InputValueVO[]> {
  title?: string;
  tooltip?: string;
  nameProps?: Partial<NodeInputNameProps>;
}

export const LoopOutputsField = ({
  name,
  defaultValue,
  title,
  tooltip,
  nameProps = {},
}: LoopOutputsFieldProps) => {
  const readonly = useReadonly();
  return (
    <FieldArray<InputValueVO> name={name} defaultValue={defaultValue}>
      {({ field }: FieldArrayRenderProps<InputValueVO>) => {
        const { value = [], delete: remove, append } = field;
        return (
          <Section
            title={title}
            tooltip={tooltip}
            actions={
              !readonly
                ? [
                    <AddButton
                      onClick={() => {
                        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                        append({} as InputValueVO);
                      }}
                    />,
                  ]
                : []
            }
            isEmpty={!value || value?.length === 0}
            emptyText={I18n.t('workflow_inputs_empty')}
          >
            <ColumnsTitleWithAction
              columns={[
                {
                  title: I18n.t('workflow_detail_node_parameter_name'),
                  style: {
                    flex: 2,
                    minWidth: 0,
                  },
                },
                {
                  title: I18n.t('workflow_detail_node_parameter_value'),
                  style: {
                    flex: 3,
                    minWidth: 0,
                  },
                },
                {
                  title: I18n.t('workflow_detail_start_variable_type'),
                  style: {
                    width: 90,
                  },
                },
              ]}
              readonly={readonly}
              className="mb-[8px]"
            />
            <FieldRows>
              {field.map((item, index) => (
                <FieldArrayItem
                  key={item.key}
                  hiddenRemove={readonly}
                  onRemove={() => remove(index)}
                >
                  <div style={{ flex: 2 }}>
                    <NodeInputNameField
                      name={`${item.name}.name`}
                      placeholder={I18n.t(
                        'workflow_detail_node_input_entername',
                      )}
                      input={item.value.input}
                      inputParameters={value}
                      {...nameProps}
                    />
                  </div>
                  <div style={{ flex: '3 1 90px', overflow: 'hidden' }}>
                    <LoopOutputSelectField name={`${item.name}.input`} />
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
