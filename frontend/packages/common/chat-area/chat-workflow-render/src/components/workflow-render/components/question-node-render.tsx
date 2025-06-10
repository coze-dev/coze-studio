import { Button } from '@coze/coze-design';

import { type QuestionRenderNodeProps } from './type';

export const QuestionNodeRender: React.FC<QuestionRenderNodeProps> = ({
  data,
  onCardSendMsg,
  readonly,
  isDisable,
  message,
}) => {
  const disabled = readonly || isDisable;
  return (
    <div>
      <div>{data.content.question}</div>
      {data.content.options.map(option => (
        <div key={option.name}>
          <Button
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
        </div>
      ))}
    </div>
  );
};
