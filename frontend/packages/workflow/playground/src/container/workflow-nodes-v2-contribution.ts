import { injectable } from 'inversify';
import {
  type FlowDocument,
  type FlowDocumentContribution,
  PlaygroundContext,
} from '@flowgram-adapter/free-layout-editor';
import {
  addBasicNodeData,
  WorkflowNodeData,
  WorkflowNodeTestRunData,
} from '@coze-workflow/nodes';

import { isNodeV2, NODES_V2 } from '@/nodes-v2';
import { nodeV2RegistryUtils } from '@/node-registries/common/utils/nodes-v2-registry-utils';

/**
 * 注册流程节点
 */
@injectable()
export class WorkflowNodesV2Contribution implements FlowDocumentContribution {
  /**
   * 注册节点
   * @param document
   */
  registerDocument(document: FlowDocument): void {
    document.registerFlowNodes(
      ...NODES_V2.map(node => nodeV2RegistryUtils.processNodeRegistry(node)),
    );

    document.registerNodeDatas(WorkflowNodeTestRunData, WorkflowNodeData);

    document.onNodeCreate(({ node }) => {
      if (isNodeV2(node)) {
        const playgroundContext =
          node.getService<PlaygroundContext>(PlaygroundContext);

        addBasicNodeData(node, playgroundContext);
      }
    });
  }
}
