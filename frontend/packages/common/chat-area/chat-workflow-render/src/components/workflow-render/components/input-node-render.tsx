import { useState } from 'react';

import { produce } from 'immer';
import { I18n } from '@coze-arch/i18n';
import { Button, Input, Space, Typography } from '@coze/coze-design';

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

  return (
    <NodeWrapperUI>
      <Space spacing={12} vertical className="w-full">
        {data?.content?.map((item, index) => (
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
                  data?.content
                    ?.map(item => `${item.name}:${inputData[item.name] || ''}`)
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
