import { type ComponentProps, type FC } from 'react';

import classNames from 'classnames';
import { IconCozCopy } from '@coze-arch/coze-design/icons';

import { ToolItemAction } from '..';

type ToolItemActionCopyProps = ComponentProps<typeof ToolItemAction>;

export const ToolItemActionCopy: FC<ToolItemActionCopyProps> = props => {
  const { disabled } = props;
  return (
    <ToolItemAction {...props}>
      <IconCozCopy
        className={classNames('text-sm', {
          'coz-fg-secondary': !disabled,
          'coz-fg-dim': disabled,
        })}
      />
    </ToolItemAction>
  );
};
