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
