import { type FC } from 'react';

import { Tooltip } from '@coze-arch/coze-design';

interface Props {
  label?: string;
  tooltip?: string;
}

export const OptionItem: FC<Props> = ({ label, tooltip }) => (
  <Tooltip content={tooltip} position="left" spacing={40}>
    <div className="pl-2">{label}</div>
  </Tooltip>
);
