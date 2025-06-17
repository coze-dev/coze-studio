import { type MouseEventHandler, type FC, type ReactNode } from 'react';

import { Tooltip, IconButton } from '@coze-arch/coze-design';

export const TooltipAction: FC<{
  icon: ReactNode;
  tooltip: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  testID?: string;
}> = props => {
  const { icon, tooltip, onClick, testID } = props;
  return (
    <Tooltip content={tooltip} autoAdjustOverflow>
      <IconButton
        icon={icon}
        color="secondary"
        onClick={onClick}
        data-testid={testID}
      />
    </Tooltip>
  );
};
