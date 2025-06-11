import { type FC } from 'react';

import { Popover, type PopoverProps } from '@coze/coze-design';

import s from './index.module.less';

type ToolPopoverProps = {
  children: JSX.Element;
  hideToolTip?: boolean;
} & PopoverProps;

export const ToolPopover: FC<ToolPopoverProps> = props => {
  const { content, children, hideToolTip, ...restProps } = props;
  return (
    <Popover
      showArrow
      position="top"
      className={s['tool-popover']}
      trigger={hideToolTip ? 'custom' : 'hover'}
      visible={hideToolTip ? false : undefined}
      content={content}
      style={{ backgroundColor: '#363D4D', padding: 8 }}
      {...restProps}
    >
      {children}
    </Popover>
  );
};
