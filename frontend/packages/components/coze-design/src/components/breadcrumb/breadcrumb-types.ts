import { type BreadcrumbProps as SemiBreadcrumbProps } from '@douyinfe/semi-ui/lib/es/breadcrumb';

import { type IComponentBaseProps } from '@/typings';

export interface BreadcrumbProps
  extends IComponentBaseProps,
    Omit<SemiBreadcrumbProps, 'compact'> {
  size?: 'small' | 'default';
}
