import { usePlaygroundTools } from '@flowgram-adapter/free-layout-editor';

import type { ToolbarHandlers } from '../type';
import { useMinimapVisible } from './use-minimap-visible';
import { useAddNode } from './use-add-node';

export const useToolbarHandlers = (): ToolbarHandlers => {
  const playgroundTools = usePlaygroundTools();
  const addNode = useAddNode();
  const { minimapVisible, setMinimapVisible } = useMinimapVisible();
  return {
    ...playgroundTools,
    addNode,
    minimapVisible,
    setMinimapVisible,
  };
};
