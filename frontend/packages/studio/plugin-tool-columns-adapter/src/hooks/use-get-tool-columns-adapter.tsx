import { type ReactNode } from 'react';

import {
  useGetToolColumns,
  type UseGetToolColumnsProps,
} from '@coze-studio/plugin-tool-columns';

export interface UseGetToolColumnsAdapterProps
  extends Omit<UseGetToolColumnsProps, 'customRender'> {
  unlockPlugin: () => Promise<void>;
  refreshPage: () => void;
}

export type UseGetToolColumnsAdapterType = (
  props: UseGetToolColumnsAdapterProps,
) => {
  reactNode?: ReactNode;
} & ReturnType<typeof useGetToolColumns>;

export const useGetToolColumnsAdapter: UseGetToolColumnsAdapterType = props => {
  const { getColumns } = useGetToolColumns(props);
  return { getColumns };
};
