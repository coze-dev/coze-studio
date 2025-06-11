import { IconCozIllusEmpty } from '@coze/coze-design/illustrations';
import { Spin } from '@coze/coze-design';

import css from './template.module.less';

export const EmptyTemplate = () => (
  <div className={css['full-template']}>
    <IconCozIllusEmpty width="100px" height="100px" />
  </div>
);

export const LoadingTemplate = () => (
  <div className={css['full-template']}>
    <Spin />
  </div>
);
