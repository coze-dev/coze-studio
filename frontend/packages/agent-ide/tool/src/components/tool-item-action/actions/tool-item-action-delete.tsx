import { type ComponentProps, type FC } from 'react';

import classNames from 'classnames';
import { IconCozTrashCan } from '@coze/coze-design/icons';

import { ToolItemAction } from '..';

type ToolItemActionDeleteProps = ComponentProps<typeof ToolItemAction>;

export const ToolItemActionDelete: FC<ToolItemActionDeleteProps> = props => {
  const { disabled } = props;
  return (
    <ToolItemAction {...props}>
      <IconCozTrashCan
        className={classNames('text-sm', {
          'coz-fg-secondary': !disabled,
          'coz-fg-dim': disabled,
        })}
      />
    </ToolItemAction>
  );
};
