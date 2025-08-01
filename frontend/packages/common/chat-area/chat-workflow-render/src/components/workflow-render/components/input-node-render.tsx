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

import { useState } from 'react';

import { noop } from 'lodash-es';
import { produce } from 'immer';
import { typeSafeJsonParse } from '@coze-common/chat-area-utils';
import { I18n } from '@coze-arch/i18n';
import { Button, Input, Space, Typography } from '@coze-arch/coze-design';

import {
  isInputWorkflowNodeContent,
  isInputWorkflowNodeContentLikelyArray,
} from './utils';
import { type InputRenderNodeProps } from './type';
import { NodeWrapperUI } from './node-wrapper-ui';

export const InputNodeRender: React.FC<InputRenderNodeProps> = ({
  data,
  onCardSendMsg,
  readonly,
  isDisable,
  message,
}) => {
  const [inputData, setInputData] = useState<Record<string, string>>({});
  const [hasSend, setHasSend] = useState(false);
  const disabled = readonly || isDisable || hasSend;
  const parsedContent = typeSafeJsonParse(data.content, noop);

  if (!isInputWorkflowNodeContentLikelyArray(parsedContent)) {
    return 'input node content is not supported';
  }

  const validContent = parsedContent.filter(isInputWorkflowNodeContent);

  return (
    <NodeWrapperUI>
      <Space spacing={12} vertical className="w-full">
        {validContent.map((item, index) => (
          <Space
            align="start"
            className="w-full"
            spacing={6}
            vertical
            key={item.name + index}
          >
            <Typography.Text ellipsis className="text-lg !font-medium">
              {item?.name}
            </Typography.Text>
            <Input
              disabled={disabled || hasSend}
              value={inputData[item.name]}
              onChange={value => {
                setInputData(
                  produce(draft => {
                    draft[item.name] = value;
                  }),
                );
              }}
            />
          </Space>
        ))}

        <Button
          className="w-full"
          disabled={disabled}
          onClick={() => {
            if (disabled) {
              return;
            }
            setHasSend(true);
            onCardSendMsg?.({
              message,
              extra: {
                msg:
                  validContent
                    .map(item => `${item.name}:${inputData[item.name] || ''}`)
                    .join('\n') || '',
                mentionList: [],
              },
            });
          }}
        >
          {I18n.t('workflow_detail_title_testrun_submit')}
        </Button>
      </Space>
    </NodeWrapperUI>
  );
};
