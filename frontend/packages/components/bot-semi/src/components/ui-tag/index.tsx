import { LegacyRef, forwardRef } from 'react';

import cls from 'classnames';
import { TagProps, TagColor } from '@douyinfe/semi-ui/lib/es/tag/interface';
import { Tag } from '@douyinfe/semi-ui';

import s from './index.module.less';

export type UITagProps = TagProps;
export { TagColor };

export const UITag = forwardRef(
  ({ className, ...props }: UITagProps, ref: LegacyRef<Tag>) => (
    <Tag {...props} className={cls(s['ui-tag'], className)} ref={ref} />
  ),
);

export default UITag;
