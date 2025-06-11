import { useGlobalState } from '@/hooks';

import { genGlobalVariableData } from './utils';
import { type VariableTreeDataNode } from './types';

export default function useGlobalVariableCache(
  dataSource: VariableTreeDataNode[],
) {
  const { isInIDE } = useGlobalState();
  const useNewGlobalVariableCache = !isInIDE;

  const dataSourceWithGlobal = useNewGlobalVariableCache
    ? genGlobalVariableData(dataSource)
    : dataSource;

  return dataSourceWithGlobal;
}
