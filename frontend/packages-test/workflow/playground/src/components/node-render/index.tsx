import { type WorkflowNodeRenderProps } from '@flowgram-adapter/free-layout-editor';

import { NodeContextProvider } from '../node-context-provider';
import { NodeRenderNew } from './node-render-new';

export function NodeRender(props: WorkflowNodeRenderProps) {
  const { node } = props;

  return (
    <NodeContextProvider node={node} scene="new-node-render">
      <NodeRenderNew {...props} />
    </NodeContextProvider>
  );
}
