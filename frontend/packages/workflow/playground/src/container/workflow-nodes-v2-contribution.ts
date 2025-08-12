/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
 * Register process node
 */
@injectable()
export class WorkflowNodesV2Contribution implements FlowDocumentContribution {
  /**
   * Register Node
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
