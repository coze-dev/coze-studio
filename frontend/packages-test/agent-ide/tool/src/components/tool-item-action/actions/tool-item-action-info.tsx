import { type ComponentProps, type FC } from 'react';

import classNames from 'classnames';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';

import { ToolItemAction } from '..';

type ToolItemActionInfoProps = ComponentProps<typeof ToolItemAction>;

export const ToolItemActionInfo: FC<ToolItemActionInfoProps> = props => {
  const { disabled } = props;

  return (
    <ToolItemAction {...props}>
      <IconCozInfoCircle
        className={classNames('text-sm', {
          'coz-fg-secondary': !disabled,
          'coz-fg-dim': disabled,
        })}
      />
    </ToolItemAction>
  );
};
