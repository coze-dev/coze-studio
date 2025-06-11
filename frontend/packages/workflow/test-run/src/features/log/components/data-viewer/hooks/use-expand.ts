import { useMemoizedFn } from 'ahooks';

import { useDataViewerStore } from './use-data-viewer-store';

export const useExpand = (path: string) => {
  const { expand, setExpand } = useDataViewerStore(store => ({
    expand: !!store.expand?.[path],
    setExpand: store.setExpand,
  }));

  const toggle = useMemoizedFn(() => {
    setExpand(path, !expand);
  });

  return {
    expand,
    toggle,
  };
};
