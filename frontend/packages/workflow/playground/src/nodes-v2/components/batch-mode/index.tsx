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

import React, { useMemo } from 'react';

import {
  useForm,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { FlowNodeBaseType } from '@flowgram-adapter/free-layout-editor';
import {
  useEntityFromContext,
  usePlayground,
} from '@flowgram-adapter/free-layout-editor';
import { SettingOnErrorProcessType } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';

import { type ComponentProps } from '@/nodes-v2/components/types';
import { Radio } from '@/nodes-v2/components/radio';
import { FormCard } from '@/form-extensions/components/form-card';

export const BatchMode = ({
  name,
  value,
  onChange,
  onBlur,
}: ComponentProps<string>) => {
  const node = useEntityFromContext() as FlowNodeEntity;

  const playground = usePlayground();
  const { isBatchV2 } = playground.context.schemaGray;
  const form = useForm();
  const processType = form.getValueIn('settingOnError.processType');

  const options = useMemo(() => {
    const isExceptionSetting =
      processType === SettingOnErrorProcessType.EXCEPTION;
    const isBatchDisabled =
      node.parent?.flowNodeType === FlowNodeBaseType.SUB_CANVAS ||
      isExceptionSetting;
    const disabledTooltip = isExceptionSetting
      ? I18n.t(
          'workflow_250416_05',
          undefined,
          '需要先把节点的异常处理方式改为中断流程或者返回设定内容，才能改为批处理模式',
        )
      : '';

    return [
      {
        value: 'single',
        label: I18n.t('workflow_batch_tab_single_radio'),
      },
      {
        value: 'batch',
        label: disabledTooltip ? (
          <Tooltip content={disabledTooltip}>
            <div>{I18n.t('workflow_batch_tab_batch_radio')}</div>
          </Tooltip>
        ) : (
          I18n.t('workflow_batch_tab_batch_radio')
        ),
        disabled: isBatchDisabled,
      },
    ];
  }, [node, processType]);

  if (isBatchV2) {
    return <></>;
  }

  return (
    <FormCard collapsible={false}>
      <Radio
        name={name}
        mode={'button'}
        options={options}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
    </FormCard>
  );
};
