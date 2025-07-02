import React, { type FC } from 'react';

import { Tooltip, type TooltipProps } from '@coze-arch/coze-design';

interface Props extends TooltipProps {
  disabled?: boolean;
}

export const TooltipWithDisabled: FC<Props> = ({ disabled, ...props }) => {
  if (disabled) {
    return <>{props.children}</>;
  }

  return <Tooltip {...props}></Tooltip>;
};
