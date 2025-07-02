import { type ComponentProps, type FC } from 'react';

import classNames from 'classnames';
import { IconCozSetting } from '@coze-arch/coze-design/icons';

import { ToolItemAction } from '..';

type ToolItemActionSettingProps = ComponentProps<typeof ToolItemAction>;

export const ToolItemActionSetting: FC<ToolItemActionSettingProps> = props => {
  const { disabled } = props;
  return (
    <ToolItemAction {...props}>
      <IconCozSetting
        className={classNames('text-sm', {
          'coz-fg-secondary': !disabled,
          'coz-fg-dim': disabled,
        })}
      />
    </ToolItemAction>
  );
};
