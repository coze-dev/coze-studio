/** Text 组件，超出自动 ... 并且展示 tooltip */
import { type FC } from 'react';

import { Typography } from '@coze-arch/coze-design';
import { type Position } from '@coze-arch/bot-semi/Tooltip';

interface IText {
  text?: string;
  rows?: number;
  className?: string;
  tooltipPosition?: Position;
}
export const Text: FC<IText> = props => {
  const { text = '', rows = 1, className, tooltipPosition } = props;
  return (
    <Typography.Paragraph
      ellipsis={{
        rows,
        showTooltip: {
          type: 'tooltip',
          opts: {
            style: {
              width: '100%',
              wordBreak: 'break-word',
            },
            position: tooltipPosition,
          },
        },
      }}
      className={className}
    >
      {text}
    </Typography.Paragraph>
  );
};
