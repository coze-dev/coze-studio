import { useCallback } from 'react';

import { useContextSelector } from 'use-context-selector';

import { JsonViewerContext } from '../context';

export const useExpand = (path: string) => {
  const expand = useContextSelector(
    JsonViewerContext,
    v => v.expand?.[path] || false,
  );
  const setExpand = useContextSelector(JsonViewerContext, v => v.onExpand);
  const handleExpandChange = useCallback(() => {
    setExpand(path, !expand);
  }, [path, expand, setExpand]);
  return {
    expand,
    onChange: handleExpandChange,
  };
};
