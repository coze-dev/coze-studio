import { type ReactNode } from 'react';

import classNames from 'classnames';
// eslint-disable-next-line @coze-arch/no-pkg-dir-import
import { type TagColor } from '@coze/coze-design/src/components/tag/tag-types';
import { Tag } from '@coze/coze-design';

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
