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

import { useMemo } from 'react';

import {
  type SetterComponentProps,
  type SetterExtension,
} from '@flowgram-adapter/free-layout-editor';
import { cronJobTranslator } from '@coze-workflow/components';
import { CronJobType, type CronJobValue } from '@coze-workflow/nodes';
import { ValueExpressionType, ValueExpression } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';

import { Text } from '@/form-extensions/components/text';

import { FixCronjobSelect } from './fix-cronjob';
import { AICronjobSelect } from './ai-cronjob';

type CronJobSelectProps = SetterComponentProps<
  CronJobValue,
  { needRefInput?: boolean }
>;

const CronJobSelect = (props: CronJobSelectProps) => {
  const {
    value = {
      type: CronJobType.Selecting,
      content: {
        type: ValueExpressionType.LITERAL,
        content: '',
      },
    },
    onChange: _onChange,
    options,
    readonly,
    context,
    feedbackStatus,
  } = props;

  const hasError = feedbackStatus === 'error';
  const { needRefInput } = options;

  const type = value.type ?? CronJobType.Selecting;
  const onChange = (content: ValueExpression | undefined) => {
    _onChange({
      type,
      content: content ?? {
        type: ValueExpressionType.LITERAL,
      },
    });
  };

  const cronjobTranslateText = useMemo(() => {
    if (
      hasError ||
      type === CronJobType.Selecting ||
      (value.content && ValueExpression.isRef(value.content))
    ) {
      return '';
    }

    return cronJobTranslator(value.content?.content as unknown as string);
  }, [hasError, value.content, type]);

  return (
    <div>
      <div className="flex flex-row gap-[2px]">
        <Select
          size="small"
          value={type}
          className="w-fit mb-[4px]"
          disabled={readonly}
          onChange={v => {
            _onChange({
              type: v as CronJobType,
              content: {
                type: ValueExpressionType.LITERAL,
              },
            });
          }}
          optionList={[
            {
              label: I18n.t(
                'workflow_start_trigger_cron_option',
                {},
                '选择预设时间',
              ),
              value: CronJobType.Selecting,
            },
            {
              label: I18n.t(
                'workflow_start_trigger_cron_job',
                {},
                '使用Cron表达式',
              ),
              value: CronJobType.Cronjob,
            },
          ]}
        ></Select>

        <div className="flex-1 overflow-hidden">
          {type === CronJobType.Selecting ? (
            <FixCronjobSelect
              hasError={hasError}
              value={value.content}
              onChange={onChange}
              readonly={readonly}
            />
          ) : (
            <AICronjobSelect
              hasError={hasError}
              value={value.content}
              onChange={onChange}
              readonly={readonly}
              node={context.node}
              needRefInput={needRefInput}
            />
          )}
        </div>
      </div>
      {cronjobTranslateText ? (
        <div className="coz-mg-primary w-full h-[24px] flex flex-row items-center justify-center rounded-[4px]">
          <Text text={cronjobTranslateText} className="text-[12px]" />
        </div>
      ) : null}
    </div>
  );
};

export const cronJobSelect: SetterExtension = {
  key: 'CronJobSelect',
  component: CronJobSelect,
};
