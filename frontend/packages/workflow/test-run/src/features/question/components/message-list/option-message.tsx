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

import classNames from 'classnames';
import { Typography } from '@coze-arch/coze-design';

import { type ReceivedMessage, type OptionMessageContent } from '../../types';
import { useSendMessage } from '../../hooks';
import { typeSafeJSONParse } from '../../../../utils';

const { Text } = Typography;

interface OptionMessageProps {
  message: ReceivedMessage;
}

export const OptionMessage: React.FC<OptionMessageProps> = ({ message }) => {
  const { content } = message;

  const { send, waiting } = useSendMessage();

  const disabled = waiting;

  const { options, question } = useMemo(
    () => (typeSafeJSONParse(content) || {}) as OptionMessageContent,
    [content],
  );

  const handleSelect = (text: string) => {
    if (disabled) {
      return;
    }

    send?.(text);
  };

  return (
    <div className="bg-[#F5F5F5] w-full rounded-[16px] p-4">
      <div className="text-[17px] font-semibold">
        <pre style={{ margin: 0 }}>{question}</pre>
      </div>
      <div className="mt-3 space-y-[10px]">
        {options?.map(option => (
          <div
            className={classNames(
              'px-4 py-2 rounded-[12px] relative hover:coz-mg-primary active:coz-mg-secondary-pressed',
              {
                'bg-[#fff]': !disabled,
                'bg-[#2E2E380A]': disabled,

                'cursor-pointer': !disabled,
                'cursor-not-allowed': disabled,
              },
            )}
            onClick={() => handleSelect(option.name)}
          >
            <div className="flex">
              <Text
                className={classNames({
                  'text-[#0607094D]': disabled,
                  'cursor-pointer': !disabled,
                  'cursor-not-allowed': disabled,
                })}
                ellipsis={{
                  showTooltip: {
                    type: 'popover',
                    opts: {
                      showArrow: true,
                      style: {
                        maxWidth: 224,
                      },
                    },
                  },
                  rows: 6,
                }}
              >
                {option.name}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
