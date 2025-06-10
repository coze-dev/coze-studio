import { createContext } from 'react';

export type NodeRenderScene =
  | 'new-node-render'
  | 'node-side-sheet'
  | 'old-node-render'
  | 'side-expand-modal'
  | undefined;

/** 用来判断node-render前端在什么场景下使用 */
export const NodeRenderSceneContext = createContext<NodeRenderScene>(undefined);
