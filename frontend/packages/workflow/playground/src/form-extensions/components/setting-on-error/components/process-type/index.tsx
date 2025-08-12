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

import { SettingOnErrorProcessType } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';

import { type SettingOnErrorItemProps } from '../../types';
import { type Option } from './types';
import { OptionItem } from './option-item';

/**
 * timeout
 */
export const ProcessType: FC<
  SettingOnErrorItemProps<SettingOnErrorProcessType> & {
    isBatch?: boolean;
  }
> = ({ value, onChange, readonly, isBatch }) => {
  const options: Option[] = [
    {
      value: SettingOnErrorProcessType.BREAK,
      label: I18n.t('workflow_250407_208', undefined, '中断流程'),
      tooltip: I18n.t(
        'workflow_250407_209',
        undefined,
        '发生异常后，中断流程执行。异常信息将会显示在节点卡片上，或者通过调用结果返回。',
      ),
    },
    {
      value: SettingOnErrorProcessType.RETURN,
      label: I18n.t('workflow_250407_210', undefined, '返回设定内容'),
      tooltip: I18n.t(
        'workflow_250407_211',
        undefined,
        '发生异常后，流程不会中断。异常信息会通过isSuccess、errorBody返回。开发者可设定需要返回的内容。',
      ),
    },
    ...(isBatch
      ? []
      : [
          {
            value: SettingOnErrorProcessType.EXCEPTION,
            label: I18n.t('workflow_250407_212', undefined, '执行异常流程'),
            tooltip: I18n.t(
              'workflow_250407_213',
              undefined,
              '发生异常后，流程不会中断。异常信息会通过isSuccess、errorBody返回，同时会新增异常分支。开发者需要完善异常处理流程后，方可运行流程。',
            ),
          },
        ]),
  ];

  return (
    <Select
      size="small"
      data-testid="setting-on-error-process-type"
      optionList={options.map(option => ({
        ...option,
        label: <OptionItem label={option.label} tooltip={option.tooltip} />,
      }))}
      renderSelectedItem={(optionNode: unknown) => {
        const option = options.find(
          item =>
            item.value ===
            (optionNode as { value: SettingOnErrorProcessType })?.value,
        );

        if (option) {
          return <div>{option.label}</div>;
        }

        return null;
      }}
      value={value || SettingOnErrorProcessType.BREAK}
      onChange={v => {
        onChange?.(v as SettingOnErrorProcessType);
      }}
      disabled={readonly}
    />
  );
};
