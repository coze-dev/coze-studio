import { type PaginationProps as SemiPaginationProps } from '@douyinfe/semi-ui/lib/es/pagination';

import { type IComponentBaseProps } from '@/typings';

export interface PaginationProps
  extends IComponentBaseProps,
    Omit<SemiPaginationProps, 'size'> {
  size?: 'default' | 'small';
  layout?: 'default' | 'simple';
  // Additional props specific to our implementation can be added here
}
