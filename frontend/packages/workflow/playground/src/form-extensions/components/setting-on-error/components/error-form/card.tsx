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

import React from 'react';

import { StandardNodeType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { type ErrorFormPropsV2 } from '../../types';
import { FormCard } from '../../../form-card';
import { useExpand } from './use-exapand';
import { ErrorFormContent } from './content';

export const ErrorFormCard: React.FC<ErrorFormPropsV2> = ({
  isOpen = false,
  onSwitchChange,
  json,
  onJSONChange,
  readonly,
  errorMsg,
  defaultValue,
  noPadding,
  ...props
}) => {
  let tooltip = I18n.t(
    'workflow_250421_03',
    undefined,
    '可设置异常处理,包括超时、重试、异常处理方式。',
  );
  const node = useCurrentEntity();
  if (node.flowNodeType === StandardNodeType.LLM) {
    tooltip += I18n.t(
      'workflow_250416_03',
      undefined,
      '在开启流式输出的情况下，一旦开始接受数据即便出错，也无法重试和跳转异常分支。',
    );
  }
  const expand = useExpand(props.value);

  return (
    <FormCard
      header={I18n.t('workflow_250416_01')}
      tooltip={tooltip}
      noPadding={noPadding}
      defaultExpand={expand}
      testId="setting-on-error"
    >
      <ErrorFormContent
        isOpen={isOpen}
        onSwitchChange={onSwitchChange}
        json={json}
        onJSONChange={onJSONChange}
        readonly={readonly}
        errorMsg={errorMsg}
        defaultValue={defaultValue}
        noPadding={noPadding}
        {...props}
      />
    </FormCard>
  );
};
