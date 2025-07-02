import { type FC } from 'react';

import { Tooltip, type TooltipProps } from '@coze-arch/coze-design';
// import { type TooltipProps } from '@douyinfe/semi-ui/lib/es/tooltip';

type IProps = {
  children: JSX.Element;
  hideToolTip?: boolean;
} & TooltipProps;

export const UIKitTooltip: FC<IProps> = props => {
  const {
    content,
    children,
    hideToolTip,
    theme = 'dark',
    ...restProps
  } = props;
  return content ? (
    <Tooltip
      trigger={hideToolTip ? 'custom' : 'hover'}
      visible={hideToolTip ? false : undefined}
      content={content}
      theme={theme}
      {...restProps}
      style={{ marginBottom: '8px' }}
    >
      {children}
    </Tooltip>
  ) : (
    <>{children}</>
  );
};

UIKitTooltip.displayName = 'UIKitTooltip';
