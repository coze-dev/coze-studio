import React, { type MouseEvent } from 'react';

import { IconCozArrowDown } from '@coze-arch/coze-design/icons';

export const ExpandIcon = ({
  onClick,
}: {
  onClick?: (e: MouseEvent) => void;
}) => (
  <IconCozArrowDown
    className="coz-fg-secondary text-xs semi-tree-option-expand-icon"
    onClick={onClick}
  />
);
