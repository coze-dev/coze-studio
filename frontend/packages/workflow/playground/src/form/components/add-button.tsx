import { type MouseEventHandler } from 'react';

import { IconCozPlus } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';

interface AddButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  disabled?: boolean;
  className?: string;
  dataTestId?: string;
  children?: React.ReactNode;
}

export function AddButton({
  onClick,
  disabled = false,
  className,
  dataTestId,
  children,
}: AddButtonProps) {
  return (
    <IconButton
      data-testid={dataTestId}
      color="highlight"
      onClick={onClick}
      icon={<IconCozPlus />}
      size="small"
      className={className}
      disabled={disabled}
      children={children}
    />
  );
}
