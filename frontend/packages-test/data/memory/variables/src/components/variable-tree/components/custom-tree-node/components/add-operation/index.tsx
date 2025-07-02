import React from 'react';

import { IconAdd } from '@coze-arch/bot-icons';
import { IconCozAddNode } from '@coze-arch/coze-design/icons';
import { IconButton, type ButtonProps } from '@coze-arch/coze-design';

type AddOperationProps = React.PropsWithChildren<{
  readonly?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  subitem?: boolean;
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
}>;

export default function AddOperation({
  readonly,
  onClick,
  className,
  style,
  disabled,
  subitem = false,
  size,
  color,
  ...restProps
}: AddOperationProps) {
  if (readonly) {
    return null;
  }

  return (
    <IconButton
      data-testid={restProps['data-testid']}
      onClick={onClick}
      className={`${disabled ? 'disabled:text-[rgb(28,31,35,0.35)]' : 'text-[#4d53e8]'} ${className}`}
      style={style}
      icon={
        subitem ? (
          <IconCozAddNode />
        ) : (
          <IconAdd className="text-[#4d53e8] disabled:text-[rgb(28,31,35,0.35)]" />
        )
      }
      disabled={disabled}
      size={size}
      color={color}
    />
  );
}
