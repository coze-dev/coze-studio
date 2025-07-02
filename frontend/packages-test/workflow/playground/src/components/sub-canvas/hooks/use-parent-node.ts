import { useMemo } from 'react';

import {
  useNodeRender,
  type WorkflowSubCanvas,
} from '@flowgram-adapter/free-layout-editor';

export const useParentNode = () => {
  const { node } = useNodeRender();
  const nodeMeta = node.getNodeMeta();

  const parentNode = useMemo(() => {
    const subCanvas: WorkflowSubCanvas = nodeMeta.subCanvas(node);
    return subCanvas.parentNode;
  }, [node, nodeMeta]);

  return parentNode;
};
