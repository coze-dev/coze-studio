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
  FlowNodesContentLayer,
  FlowNodesTransformLayer,
  type FlowRendererContribution,
  type FlowRendererRegistry,
  FlowScrollBarLayer,
  FlowScrollLimitLayer,
  type FlowDocument,
  type FlowDocumentContribution,
  FlowNodeRenderData,
  FlowNodeTransformData,
  FlowNodeTransitionData,
  PlaygroundLayer,
  FixedLayoutRegistries,
} from '@flowgram-adapter/fixed-layout-editor';

import { FlowLinesLayer } from '../../layers';

@injectable()
export class FlowRegisters
  implements FlowDocumentContribution, FlowRendererContribution
{
  /**
   * registration data layer
   * @param document
   */
  registerDocument(document: FlowDocument) {
    /**
     * Registered Node (ECS - Entity)
     */
    document.registerFlowNodes(
      // Wait for Simplification
      FixedLayoutRegistries.RootRegistry, // root node
      FixedLayoutRegistries.StartRegistry, // start node
      FixedLayoutRegistries.DynamicSplitRegistry, // Dynamic branching (parallel, exclusive)
      FixedLayoutRegistries.BlockRegistry, // Single block registration
      FixedLayoutRegistries.InlineBlocksRegistry, // A list of multiple blocks
      FixedLayoutRegistries.BlockIconRegistry, // Icon nodes, such as diamond icons for conditional branches
      // FixedLayoutRegistries. EndRegistry,//End Node
      FixedLayoutRegistries.EmptyRegistry, // placeholder node
    );
    /**
     * Registered Node Data (ECS - Components)
     */
    document.registerNodeDatas(
      FlowNodeRenderData, // Render node related data
      FlowNodeTransitionData, // line drawing data
      FlowNodeTransformData, // coordinate calculation data
    );
  }

  /**
   * Register the render layer
   * @param renderer
   */
  registerRenderer(renderer: FlowRendererRegistry) {
    /**
     * Registration layer (ECS - System)
     */
    renderer.registerLayers(
      FlowNodesTransformLayer, // Node position rendering
      FlowNodesContentLayer, // Node content rendering
      FlowLinesLayer, // line rendering
      // FlowLabelsLayer,//Label rendering
      PlaygroundLayer, // Canvas base layer, providing zoom, gesture, and more
      FlowScrollLimitLayer, // Control scroll range
      FlowScrollBarLayer, // scroll bar
    );
  }
}
