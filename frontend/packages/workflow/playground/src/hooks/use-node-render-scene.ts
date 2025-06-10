import { useContext } from 'react';

import { NodeRenderSceneContext } from '@/contexts/node-render-context';

export function useNodeRenderScene() {
  const scene = useContext(NodeRenderSceneContext);

  return {
    isNewNodeRender: scene === 'new-node-render',
    isOldNodeRender: scene === 'old-node-render',
    isNodeSideSheet: scene === 'node-side-sheet',
  };
}
