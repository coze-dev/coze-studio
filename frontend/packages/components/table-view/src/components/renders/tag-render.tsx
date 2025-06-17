import { type ReactNode } from 'react';

import classNames from 'classnames';
import { type TagColor } from '@coze-arch/coze-design/types';
import { Tag } from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface TagRenderProps {
  value: string | ReactNode;
  className?: string;
  size?: 'small' | 'mini';
  color?: TagColor;
}
export const TagRender = ({
  value,
  className,
  size,
  color,
}: TagRenderProps) => (
  <Tag
    className={classNames(className, styles['tag-render'])}
    size={size}
    color={color ?? 'primary'}
  >
    {value}
  </Tag>
);
