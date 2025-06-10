import { type ComponentProps, type FC } from 'react';

import classNames from 'classnames';
import { IconCozHamburger } from '@coze/coze-design/icons';

import { ToolItemAction } from '..';

type ToolItemActionEditProps = ComponentProps<typeof ToolItemAction> & {
  isDragging: boolean;
};

export const ToolItemActionDrag: FC<ToolItemActionEditProps> = props => {
  const { disabled, isDragging } = props;
  return (
    <ToolItemAction hoverStyle={false} {...props}>
      <IconCozHamburger
        className={classNames('text-sm', {
          'coz-fg-secondary': !disabled,
          'coz-fg-dim': disabled,
          'cursor-grab': !isDragging,
          'cursor-grabbing': isDragging,
        })}
      />
    </ToolItemAction>
  );
};
