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

import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozSetting,
  IconCozInfoCircle,
} from '@coze-arch/coze-design/icons';
import {
  IconButton,
  Tooltip,
  Typography,
  Popover,
  Divider,
} from '@coze-arch/coze-design';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { ExpressionEditorField } from '@/node-registries/common/fields';
import { useWatch } from '@/form';
import { CopyButton } from '@/components/copy-button';

import { SliderWithInputField } from './slider-with-input-field';

import styles from './question-limit.module.less';

const MAX_ROUND = 5;
const MIN_ROUND = 1;

export const QuestionLimit = () => {
  const { getNodeSetterId } = useNodeTestId();
  const readonly = useReadonly();
  const systemPrompt = useWatch<string>({ name: 'llmParam.systemPrompt' });

  const label = I18n.t(
    'workflow_ques_ans_type_direct_exrtact_title',
    {},
    "Extract variables from user's response.",
  );

  return (
    <div className="flex flex-col w-full mb-2">
      <Divider margin="12px" />
      <div className="flex w-full justify-between items-center">
        <Typography.Text
          className="mr-[6px] text-xs"
          ellipsis={{
            showTooltip: {
              opts: {
                content: label,
              },
            },
          }}
          style={{
            maxWidth: 'calc(100% - 24px)',
            color: '#1C1F23',
          }}
        >
          {label}
        </Typography.Text>
        <Popover
          autoAdjustOverflow={false}
          className={styles['limit-wrapper']}
          trigger="click"
          position="topRight"
          content={
            <div className={styles['sys-popover-content']}>
              <div className="flex items-center mb-[4px]">
                <span className={styles['content-title']}>
                  {I18n.t(
                    'workflow_ques_ans_type_direct_exrtact_context_setting',
                    {},
                    'Maximum dialogue rounds',
                  )}
                </span>
                <Tooltip
                  content={I18n.t(
                    'workflow_ques_ans_type_direct_context_setting_tooltips',
                    {},
                    '允许用户回答该问题的最多次数，当从用户的多次回答中获取不到必填的关键字段时，该工作流将会终止运行。',
                  )}
                >
                  <IconCozInfoCircle className="text-[#A7A9B0] text-[16px] ml-1" />
                </Tooltip>
              </div>
              <div className="w-full relative  mb-[16px]">
                <SliderWithInputField
                  name="questionOutputs.limit"
                  defaultValue={3}
                  max={MAX_ROUND}
                  min={MIN_ROUND}
                  sliderStyle={{
                    width: '100%',
                  }}
                />
                <div
                  className={`w-full flex justify-between absolute ${styles['slider-marks']}`}
                >
                  <div>{MIN_ROUND}</div>
                  <div>{MAX_ROUND}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-[4px]">
                <div className="flex items-center">
                  <span className={styles['content-title']}>
                    {I18n.t('workflow_question_sp', {}, '系统提示词')}
                  </span>
                  <Tooltip
                    content={I18n.t(
                      'workflow_question_sp_setting',
                      {},
                      '系统提示词设置',
                    )}
                  >
                    <IconCozInfoCircle className="text-[#A7A9B0] text-[16px] ml-1" />
                  </Tooltip>
                </div>
                {readonly ? <CopyButton value={systemPrompt ?? ''} /> : null}
              </div>
              <ExpressionEditorField
                name="llmParam.systemPrompt"
                defaultValue=""
                placeholder={I18n.t(
                  'workflow_question_sp_placeholder',
                  {},
                  '支持额外的系统提示词,如设置人设和回复逻辑,使其追问语气更加自然',
                )}
                className="!p-[4px]"
                containerClassName="!bg-transparent"
                shouldUseContainerRef
              />
            </div>
          }
        >
          <IconButton
            size="default"
            color="secondary"
            data-testid={getNodeSetterId('question-limit-setting')}
            wrapperClass="flex justify-end"
            className="!p-[4px] !max-w-[24px] !min-w-[24px] !h-[24px]"
            icon={<IconCozSetting />}
          />
        </Popover>
      </div>
    </div>
  );
};
