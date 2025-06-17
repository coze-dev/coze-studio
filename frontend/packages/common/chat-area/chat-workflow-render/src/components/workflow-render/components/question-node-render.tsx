import { Button, Space, Typography } from '@coze-arch/coze-design';

import { type QuestionRenderNodeProps } from './type';
import { NodeWrapperUI } from './node-wrapper-ui';

export const QuestionNodeRender: React.FC<QuestionRenderNodeProps> = ({
  data,
  onCardSendMsg,
  readonly,
  isDisable,
  message,
}) => {
  const disabled = readonly || isDisable;
  return (
    <NodeWrapperUI>
      <Space className="w-full" vertical spacing={12} align="start">
        <Typography.Text ellipsis className="text-18px">
          {data.content.question}
        </Typography.Text>
        <Space className="w-full" vertical spacing={16}>
          {data.content.options.map((option, index) => (
            <Button
              key={option.name + index}
              className="w-full"
              color="primary"
              disabled={disabled}
              onClick={() =>
                onCardSendMsg?.({
                  message,
                  extra: { msg: option.name, mentionList: [] },
                })
              }
            >
              {option.name}
            </Button>
          ))}
        </Space>
      </Space>
    </NodeWrapperUI>
  );
};
