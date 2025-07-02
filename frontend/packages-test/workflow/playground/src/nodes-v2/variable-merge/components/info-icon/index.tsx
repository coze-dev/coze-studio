import { type FC } from 'react';

import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

interface Props {
  tooltip: string;
}

export const InfoIcon: FC<Props> = ({ tooltip }) => (
  <Tooltip content={tooltip}>
    <IconCozInfoCircle className="text-lg coz-fg-secondary shrink-0" />
  </Tooltip>
);
