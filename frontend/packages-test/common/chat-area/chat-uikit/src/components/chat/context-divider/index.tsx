import classNames from 'classnames';
import { Divider, Typography } from '@coze-arch/coze-design';

interface ContextDividerProps {
  className?: string;
  text?: string;
}

export const ContextDivider = ({ text, className }: ContextDividerProps) => (
  <Divider className={classNames(className, 'w-full my-24px ')} align="center">
    <Typography.Paragraph
      ellipsis={{
        showTooltip: {
          opts: {
            content: text,
            style: {
              wordBreak: 'break-word',
            },
          },
        },
        rows: 2,
      }}
      className="coz-fg-dim whitespace-pre-wrap text-center text-base leading-[16px] font-normal break-words"
    >
      {text}
    </Typography.Paragraph>
  </Divider>
);
