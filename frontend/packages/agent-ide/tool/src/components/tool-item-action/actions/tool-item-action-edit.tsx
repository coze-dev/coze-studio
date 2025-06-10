import { type ComponentProps, type FC } from 'react';

import classNames from 'classnames';
import { IconCozEdit } from '@coze/coze-design/icons';

import { ToolItemAction } from '..';

type ToolItemActionEditProps = ComponentProps<typeof ToolItemAction>;

export const ToolItemActionEdit: FC<ToolItemActionEditProps> = props => {
  const { disabled } = props;
  return (
    <ToolItemAction {...props}>
      <IconCozEdit
        className={classNames('text-sm', {
          'coz-fg-secondary': !disabled,
          'coz-fg-dim': disabled,
        })}
      />
    </ToolItemAction>
  );
};
