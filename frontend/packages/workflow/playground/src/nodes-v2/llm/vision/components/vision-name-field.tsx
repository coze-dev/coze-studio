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

import { useMemo, type FC } from 'react';

import classNames from 'classnames';
import {
  Field,
  useForm,
  type FieldArrayRenderProps,
  type FieldRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import { ViewVariableType, type InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

import { NodeInputName } from '@/nodes-v2/components/node-input-name';
import { FormItemFeedback } from '@/nodes-v2/components/form-item-feedback';

import styles from './index.module.less';

interface VisionNameFieldProps {
  inputField: FieldRenderProps<InputValueVO>['field'];
  inputsField: FieldArrayRenderProps<InputValueVO>['field'];
  enabledTypes: ViewVariableType[];
}

/**
 * Enter name field
 */
export const VisionNameField: FC<VisionNameFieldProps> = ({
  inputField,
  inputsField,
  enabledTypes,
}) => {
  const form = useForm();
  const input = form.getValueIn(`${inputField.name}.input`);

  const disabledTooltip = useMemo(() => {
    if (!enabledTypes.length) {
      return I18n.t('workflow_250310_05', undefined, '所选模型不支持视觉理解');
    }

    const type = input?.rawMeta?.type;
    if (!type || [...enabledTypes, ViewVariableType.String].includes(type)) {
      return '';
    }

    return type === ViewVariableType.Image
      ? I18n.t('workflow_250320_01', undefined, '所选模型不支持图片理解')
      : I18n.t('workflow_250320_02', undefined, '所选模型不支持视频理解');
  }, [enabledTypes, input?.rawMeta?.type]);

  return (
    <Field name={`${inputField.name}.name`}>
      {({
        field: childNameField,
        fieldState: nameFieldState,
      }: FieldRenderProps<string>) => (
        <div
          className={classNames(
            'flex-[2] min-w-0 relative',
            styles['vision-name-container'],
          )}
        >
          <NodeInputName
            {...childNameField}
            input={input}
            inputParameters={inputsField.value || []}
            isError={!!nameFieldState?.errors?.length}
            inputPrefix={
              disabledTooltip ? (
                <Tooltip content={disabledTooltip}>
                  <IconCozInfoCircle className="coz-fg-hglt-yellow cursor-pointer text-sm" />
                </Tooltip>
              ) : null
            }
          />
          <FormItemFeedback errors={nameFieldState?.errors} />
        </div>
      )}
    </Field>
  );
};
