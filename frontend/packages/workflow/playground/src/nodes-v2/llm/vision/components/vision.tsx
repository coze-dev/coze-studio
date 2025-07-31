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
  FieldArray,
  useForm,
  type FieldArrayRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import { type InputValueVO, ValueExpressionType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { AddIcon } from '@/nodes-v2/components/add-icon';
import { FormCard } from '@/form-extensions/components/form-card';
import { ColumnsTitleWithAction } from '@/form-extensions/components/columns-title-with-action';

import { useModelEnabledTypes } from '../hooks/use-model-enabled-types';
import { VisionInputField } from './vision-input-field';

import styles from './index.module.less';

interface VisionProps {
  readonly?: boolean;
}

/**
 * Visual understanding configuration
 */
export const Vision: FC<VisionProps> = () => {
  const enabledTypes = useModelEnabledTypes();
  const disabledTooltip = !enabledTypes.length
    ? I18n.t('workflow_250310_05', undefined, '所选模型不支持视觉理解')
    : '';
  const form = useForm();
  const readonly = useReadonly();

  return (
    <FieldArray name={'$$input_decorator$$.inputParameters'}>
      {({ field }: FieldArrayRenderProps<InputValueVO>) => (
        <FormCard
          header={I18n.t('workflow_250310_04', undefined, '视觉理解输入')}
          tooltip={I18n.t(
            'workflow_250320_03',
            undefined,
            '用于视觉理解的输入，传入图片or视频的url；并在Prompt中应用该输入',
          )}
        >
          <div className={styles['vision-title']}>
            <ColumnsTitleWithAction
              columns={[
                {
                  title: I18n.t('workflow_detail_variable_input_name'),
                  style: {
                    flex: 2,
                  },
                },
                {
                  title: I18n.t('workflow_detail_variable_input_value'),
                  style: {
                    flex: 3,
                  },
                },
              ]}
              readonly={readonly}
            />
          </div>
          {field.map((child, index) => (
            <VisionInputField
              inputField={child}
              inputsField={field}
              index={index}
              readonly={readonly}
              form={form}
              enabledTypes={enabledTypes}
              key={child.key}
            ></VisionInputField>
          ))}
          {readonly ? (
            <></>
          ) : (
            <div className={styles['vision-add-icon']}>
              <AddIcon
                disabledTooltip={disabledTooltip}
                onClick={() => {
                  field.append({
                    name: '',
                    input: {
                      type: ValueExpressionType.REF,
                      rawMeta: { isVision: true },
                    },
                  });
                }}
              />
            </div>
          )}
        </FormCard>
      )}
    </FieldArray>
  );
};
