import { type FC } from 'react';

import { Tooltip, type TooltipProps } from '@coze/coze-design';

import s from './index.module.less';

type ToolTooltipsProps = {
  children: JSX.Element;
  hideToolTip?: boolean;
} & TooltipProps;

export const ToolTooltip: FC<ToolTooltipsProps> = props => {
  const { content, children, hideToolTip, ...restProps } = props;
  return content ? (
    <Tooltip
      trigger={hideToolTip ? 'custom' : 'hover'}
      visible={hideToolTip ? false : undefined}
      content={content}
      className={s['tool-tooltips']}
      {...restProps}
    >
      {children}
    </Tooltip>
  ) : (
    <>{children}</>
  );
};
