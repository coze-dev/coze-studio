import React from 'react';

import { IconCozArrowRightFill } from '@coze-arch/coze-design/icons';

export const ExpandableArrow = ({ expand }: { expand?: boolean }) => (
  <IconCozArrowRightFill
    className="text-[10px] coz-fg-secondary transition-transform"
    style={expand ? { transform: 'rotate(90deg)' } : undefined}
  />
);
