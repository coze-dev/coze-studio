import { type FC } from 'react';

import { IconCozPlus } from '@coze/coze-design/icons';
import { IconButton, Tooltip } from '@coze/coze-design';

interface AddIconProps {
  disabledTooltip?: string;
  onClick?: (e) => void;
}

export const AddIcon: FC<AddIconProps> = ({ disabledTooltip, onClick }) =>
  disabledTooltip ? (
    <Tooltip content={disabledTooltip}>
      <IconButton
        disabled={!!disabledTooltip}
        color="highlight"
        size="small"
        icon={<IconCozPlus className="text-sm" />}
        onClick={onClick}
      />
    </Tooltip>
  ) : (
    <IconButton
      color="highlight"
      size="small"
      icon={<IconCozPlus className="text-sm" />}
      onClick={onClick}
    />
  );
