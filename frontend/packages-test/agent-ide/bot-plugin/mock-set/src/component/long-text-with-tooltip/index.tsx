import classNames from 'classnames';
import { type Ellipsis, type TextProps } from '@coze-arch/bot-semi/Typography';
import { Typography } from '@coze-arch/bot-semi';

import s from './index.module.less';

interface LongTextWithTooltip extends TextProps {
  tooltipText?: string;
}

export function LongTextWithTooltip(props: LongTextWithTooltip) {
  const { children, ellipsis, tooltipText, ...rest } = props;

  const ellipsisConfig: boolean | Ellipsis | undefined =
    ellipsis === false
      ? ellipsis
      : {
          showTooltip: {
            opts: {
              content: (
                <Typography.Text
                  className={classNames(s['long-text-tooltip'], s['long-text'])}
                  onClick={e => e.stopPropagation()}
                  ellipsis={{ showTooltip: false, rows: 16 }}
                >
                  {tooltipText || props.children}
                </Typography.Text>
              ),
            },
          },
          ...(typeof ellipsis !== 'object' ? {} : ellipsis),
        };

  return (
    <Typography.Text ellipsis={ellipsisConfig} {...rest}>
      {props.children}
    </Typography.Text>
  );
}
