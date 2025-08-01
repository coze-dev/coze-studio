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

import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/base';

import {
  OutputTree,
  type OutputTreeProps,
} from '@/form-extensions/components/output-tree';
import { useField, withField } from '@/form';
import { ChatHistoryRound } from '@/components/chat-history-round';

const DEFAULT_VALUE = [
  {
    key: nanoid(),
    name: 'chatHistory',
    type: ViewVariableType.ArrayObject,
    children: [
      {
        key: nanoid(),
        name: 'role',
        type: ViewVariableType.String,
      },
      {
        key: nanoid(),
        name: 'content',
        type: ViewVariableType.String,
      },
    ],
  },
] as OutputTreeProps['value'];

export const HistoryRoundField = withField(
  ({ showLine }: { showLine: boolean }) => {
    const { value, onChange, readonly } = useField<number>();

    return (
      <div className="relative">
        <OutputTree
          id="chat-history"
          readonly
          value={DEFAULT_VALUE}
          defaultCollapse
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onChange={() => {}}
          withDescription={false}
          withRequired={false}
          noCard
        />
        {showLine ? (
          <div className="h-px -mt-[3px] mb-[14px] bg-[#FFF]" />
        ) : null}

        <ChatHistoryRound
          value={value}
          readonly={readonly}
          onChange={w => {
            onChange(Number(w));
          }}
        />
      </div>
    );
  },
);
