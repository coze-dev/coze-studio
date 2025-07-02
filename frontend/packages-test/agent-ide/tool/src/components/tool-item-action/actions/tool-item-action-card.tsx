import { type ComponentProps, type FC } from 'react';

import classNames from 'classnames';
import { IconCozCardPencil } from '@coze-arch/coze-design/icons';

import { ToolItemAction } from '..';

type ToolItemActionCardProps = ComponentProps<typeof ToolItemAction>;

export const ToolItemActionCard: FC<ToolItemActionCardProps> = props => {
  const { disabled } = props;

  return (
    <ToolItemAction {...props}>
      <IconCozCardPencil
        className={classNames('text-sm', {
          'coz-fg-secondary': !disabled,
          'coz-fg-dim': disabled,
        })}
      />
    </ToolItemAction>
  );
};
