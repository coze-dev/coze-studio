import React from 'react';

import { IconCozAiFill } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';

interface AutoGenerateButtonProps {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const AutoGenerateButton: React.FC<AutoGenerateButtonProps> = ({
  onClick,
  className,
  disabled = false,
}) => (
  <IconButton
    color="highlight"
    size="small"
    className={`${className}`}
    disabled={disabled}
    onClick={onClick}
    icon={<IconCozAiFill />}
  />
);
