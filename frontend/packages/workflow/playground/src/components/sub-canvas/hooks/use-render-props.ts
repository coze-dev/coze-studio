import { useNodeRender } from '@flowgram-adapter/free-layout-editor';

import { type SubCanvasRenderProps } from '../type';

export const useSubCanvasRenderProps = (): SubCanvasRenderProps => {
  const { node } = useNodeRender();
  const nodeMeta = node.getNodeMeta();

  const {
    title = '',
    tooltip,
    renderPorts = [],
    style = {},
  } = (nodeMeta?.renderSubCanvas?.() ?? {}) as Partial<SubCanvasRenderProps>;

  return {
    title,
    tooltip,
    renderPorts,
    style,
  };
};
