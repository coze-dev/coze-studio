import { type FC } from 'react';

import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { IconCozEdit, IconCozPlus } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';

import { ToolTooltip } from '../tool-tooltip';
import { type ToolButtonCommonProps } from '../../typings/button';

interface AddButtonProps extends ToolButtonCommonProps {
  iconName?: 'add' | 'edit';
  enableAutoHidden?: boolean;
}

export const AddButton: FC<AddButtonProps> = ({
  onClick,
  tooltips,
  disabled,
  loading,
  iconName = 'add',
  enableAutoHidden,
  ...restProps
}) => {
  const readonly = useBotDetailIsReadonly();

  if (readonly && enableAutoHidden) {
    return null;
  }

  return (
    <ToolTooltip content={tooltips}>
      <div>
        <IconButton
          icon={
            iconName === 'add' ? (
              <IconCozPlus className="text-base coz-fg-secondary" />
            ) : (
              <IconCozEdit className="text-base coz-fg-secondary" />
            )
          }
          loading={loading}
          onClick={onClick}
          size="small"
          color="secondary"
          disabled={!!disabled}
          data-testid={restProps['data-testid']}
        />
      </div>
    </ToolTooltip>
  );
};
