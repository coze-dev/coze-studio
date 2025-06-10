import { type FC, type PropsWithChildren, type ReactNode } from 'react';

import classNames from 'classnames';
import { Tooltip } from '@coze/coze-design';
import { IconInfo } from '@coze-arch/bot-icons';

import s from './index.module.less';

export const ToolTipNode: FC<
  PropsWithChildren<{
    content: ReactNode;
    className?: string;
    tipContentClassName?: string;
  }>
> = ({ content, children, className, tipContentClassName }) => (
  <Tooltip
    className={tipContentClassName}
    content={<div className={classNames(s['tip-content'])}>{content}</div>}
  >
    <div className={classNames(className, 'flex items-center')}>
      <IconInfo
        className={classNames(
          s['icon-info'],
          'cursor-pointer coz-fg-secondary',
        )}
      />
      {children}
    </div>
  </Tooltip>
);
