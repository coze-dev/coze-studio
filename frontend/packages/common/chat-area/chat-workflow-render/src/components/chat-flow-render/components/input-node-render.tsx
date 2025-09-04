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

import { produce } from 'immer';
import {
  type IEventCallbacks,
  type IMessage,
} from '@coze-common/chat-uikit-shared';
import { I18n } from '@coze-arch/i18n';
import { Button, Input, Space, Typography } from '@coze-arch/coze-design';

import { type ChatflowNodeData } from './type';
import { NodeWrapperUI } from './node-wrapper-ui';

export const InputNodeRender = ({
  data,
  onCardSendMsg,
  readonly,
  isDisable,
  message,
}: {
  data: ChatflowNodeData;
  onCardSendMsg?: IEventCallbacks['onCardSendMsg'];
  readonly?: boolean;
  isDisable?: boolean;
  message: IMessage;
}) => {
  const [inputData, setInputData] = useState<Record<string, string>>({});
  const [hasSend, setHasSend] = useState(false);
  const disabled = readonly || isDisable || hasSend;

  return (
    <NodeWrapperUI>
      <Space spacing={12} vertical className="w-full">
        {data.input_card_data?.map((item, index) => (
          <Space
            align="start"
            className="w-full"
            spacing={6}
            vertical
            key={item?.name + index}
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
                  data.input_card_data
                    ?.map(item => `${item.name}:${inputData[item.name] || ''}`)
                    .join('\n') || '',
                mentionList: message.sender_id
                  ? [{ id: message.sender_id }]
                  : [],
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
