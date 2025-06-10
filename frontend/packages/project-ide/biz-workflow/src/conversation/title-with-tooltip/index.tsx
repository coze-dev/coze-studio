import React from 'react';

import cls from 'classnames';
import { IconCozInfoCircle } from '@coze/coze-design/icons';
import { Tooltip } from '@coze/coze-design';

import s from './index.module.less';

interface TitleWithTooltipProps {
  title: React.ReactNode;
  tooltip?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TitleWithTooltip: React.FC<TitleWithTooltipProps> = ({
  title,
  tooltip,
  extra,
  className,
  onClick,
}) => (
  <div className={cls(s['title-container'], className)} onClick={onClick}>
    <div className={s['title-with-tip']}>
      {title}
      <Tooltip content={tooltip}>
        <IconCozInfoCircle />
      </Tooltip>
    </div>
    <div className={s.extra} onClick={e => e.stopPropagation()}>
      {extra}
    </div>
  </div>
);
