import { type FC } from 'react';

import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';

import { ToolItemIcon } from '..';

export const ToolItemIconInfo: FC = () => (
  <ToolItemIcon>
    <IconCozInfoCircle className="text-sm coz-fg-secondary" />
  </ToolItemIcon>
);
