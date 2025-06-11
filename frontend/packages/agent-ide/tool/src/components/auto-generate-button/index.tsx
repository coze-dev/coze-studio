import { type FC } from 'react';

import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { IconButton } from '@coze/coze-design';
import { IconAuto } from '@coze-arch/bot-icons';

import { ToolTooltip } from '../tool-tooltip';
import { type ToolButtonCommonProps } from '../../typings/button';

interface AutoGenerateButtonProps extends ToolButtonCommonProps {
  enableAutoHidden?: boolean;
}

export const AutoGenerateButton: FC<AutoGenerateButtonProps> = ({
  onClick,
  tooltips,
  loading,
  disabled,
  enableAutoHidden,
  ...restProps
}) => {
  const readonly = useBotDetailIsReadonly();

  if (readonly && enableAutoHidden) {
    return null;
  }

  return (
    <ToolTooltip content={tooltips}>
      <IconButton
        icon={<IconAuto />}
        loading={loading}
        disabled={!!disabled}
        onClick={onClick}
        size="small"
        color="secondary"
        data-testid={restProps['data-testid']}
      />
    </ToolTooltip>
  );
};
