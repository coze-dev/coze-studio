import { type FC } from 'react';

import classNames from 'classnames';
import { IconCozCard } from '@coze/coze-design/icons';

import { ToolItemIcon } from '..';

interface ToolItemIconCardProps {
  isError?: boolean;
}

export const ToolItemIconCard: FC<ToolItemIconCardProps> = ({ isError }) => (
  <ToolItemIcon>
    <IconCozCard
      className={classNames('text-base', {
        'coz-fg-secondary': !isError,
        'coz-fg-hglt-yellow': isError,
      })}
    />
  </ToolItemIcon>
);
