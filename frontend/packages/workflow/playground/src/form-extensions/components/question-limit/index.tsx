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
} from '@coze-arch/coze-design';

import { SliderWithInput } from '../slider-with-input';

const { Title } = Typography;

export const QuestionLimit = props => {
  const { value, onChange, readonly } = props;

  const { getNodeSetterId } = useNodeTestId();

  const label = I18n.t(
    'workflow_ques_ans_type_direct_exrtact_title',
    {},
    "Extract variables from user's response.",
  );

  return (
    <div className="flex w-full justify-between mb-2">
      <Typography.Text
        className="mr-[6px] text-xs"
        ellipsis={{
          showTooltip: {
            opts: {
              content: label,
            },
          },
        }}
        style={{ maxWidth: 'calc(100% - 24px)', color: '#1C1F23' }}
      >
        {label}
      </Typography.Text>
      <Popover
        autoAdjustOverflow={false}
        className="rounded-md"
        trigger="click"
        position="bottomRight"
        content={
          <div className="p-6">
            <div className="flex items-center">
              <Title heading={5}>
                {I18n.t(
                  'workflow_ques_ans_type_direct_exrtact_context_setting',
                  {},
                  'Maximum dialogue rounds',
                )}
              </Title>
              <Tooltip
                content={I18n.t(
                  'workflow_ques_ans_type_direct_context_setting_tooltips',
                  {},
                  '设置带入模型上下文的对话历史轮数。轮数越多,多轮对话的相关性越高,但消耗的Token也越多。',
                )}
              >
                <IconCozInfoCircle className="text-[#A7A9B0] text-xs ml-1" />
              </Tooltip>
            </div>
            <SliderWithInput
              readonly={readonly}
              value={value}
              onChange={onChange}
              max={5}
              min={1}
            />
          </div>
        }
      >
        <IconButton
          size="small"
          color="secondary"
          data-testid={getNodeSetterId('question-limit-setting')}
          wrapperClass="flex justify-end"
          icon={<IconCozSetting />}
        />
      </Popover>
    </div>
  );
};
