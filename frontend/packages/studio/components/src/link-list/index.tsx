import React, { type ReactNode, type CSSProperties } from 'react';

import classNames from 'classnames';
import { Space } from '@coze-arch/bot-semi';

import s from './index.module.less';

export interface LinkListItem {
  extra?: string;
  icon?: ReactNode;
  label: string;
  link?: string;
  onClick?: () => void;
}

export const LinkList = ({
  className,
  style,
  data,
  pointerClassName,
  itemClassName,
}: {
  className?: string;
  style?: CSSProperties;
  data: LinkListItem[];
  pointerClassName?: string;
  itemClassName?: string;
}) => (
  <div className={classNames(s['link-list'], className)} style={style}>
    {data?.map(item => (
      <div
        className={classNames(s['link-list-item'], itemClassName)}
        key={`link-list-${item.label}`}
      >
        {!!item.extra && <span style={{ marginRight: 4 }}>{item.extra}</span>}
        <div
          className={classNames(
            s['click-area'],
            (item.link || item.onClick) && s.pointer,
            (item.link || item.onClick) && pointerClassName,
          )}
          onClick={() => {
            if (item.link) {
              window.open(item.link);
            } else {
              item.onClick?.();
            }
          }}
        >
          <Space spacing={4}>
            {item.icon}
            {item.label}
          </Space>
        </div>
      </div>
    ))}
  </div>
);
