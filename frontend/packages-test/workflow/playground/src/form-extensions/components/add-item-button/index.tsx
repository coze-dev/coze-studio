import React, { type FC } from 'react';

import classnames from 'classnames';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

interface Props {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  readonly?: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
  testId?: string;
}

export const AddItemButton: FC<Props> = ({
  onClick,
  onMouseDown,
  disabled,
  disabledTooltip,
  className,
  style,
  title,
  testId,
}) => {
  const ButtonContent = (
    <IconButton
      color="highlight"
      size="small"
      icon={<IconCozPlus className="text-sm" />}
      onMouseDown={e => onMouseDown?.(e)}
      onClick={e => onClick?.(e)}
      className={classnames('!block', className)}
      style={style}
      disabled={disabled}
      data-testid={testId}
    />
  );

  if (disabledTooltip) {
    return <Tooltip content={disabledTooltip}>{ButtonContent}</Tooltip>;
  }

  return !disabled ? ButtonContent : null;
};
