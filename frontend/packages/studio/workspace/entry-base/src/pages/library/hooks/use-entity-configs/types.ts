import { type ReactNode } from 'react';

import { type ResourceInfo } from '@coze-arch/idl/plugin_develop';
import { type TableActionProps } from '@coze/coze-design';

import { type LibraryEntityConfig } from '../../types';

export type UseEntityConfigHook = (params: {
  spaceId: string;
  isPersonalSpace?: boolean;
  reloadList: () => void;
  getCommonActions?: (
    item: ResourceInfo,
  ) => NonNullable<TableActionProps['actionList']>;
}) => { config: LibraryEntityConfig; modals: ReactNode };
