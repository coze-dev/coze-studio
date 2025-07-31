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

import { uniqBy } from 'lodash-es';
import { injectable, inject } from 'inversify';
import { StandardNodeType } from '@coze-workflow/base/types';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowNodeEntity,
  WorkflowDocument,
  type WorkflowJSON,
  type WorkflowEdgeJSON,
  type WorkflowNodeJSON,
  type WorkflowNodeRegistry,
} from '@flowgram-adapter/free-layout-editor';

import { getNodesParentId } from '../utils/get-nodes-parent-id';
import { setNodePositionByRect } from '../utils';
import { EncapsulateContext } from '../encapsulate-context';
import { EncapsulateLinesService } from '../encapsulate/encapsulate-lines-service';
import {
  EncapsulateVariableService,
  type ConnectPortsInfo,
} from '../encapsulate';
import {
  type EncapsulateGenerateService,
  type GenerateSubWorkflowNodeOptions,
} from './types';

/**
 * Encapsulate the generation service and generate json data related to workflow
 */
@injectable()
export class EncapsulateGenerateServiceImpl
  implements EncapsulateGenerateService
{
  generate: (nodes: FlowNodeEntity[]) => Promise<WorkflowJSON>;
  @inject(EncapsulateLinesService)
  private encapsulateLinesService: EncapsulateLinesService;

  @inject(EncapsulateVariableService)
  private encapsulateVariableService: EncapsulateVariableService;

  @inject(WorkflowDocument)
  private workflowDocument: WorkflowDocument;

  @inject(EncapsulateContext)
  private encapsulateContext: EncapsulateContext;

  /**
   * Generate json for workflow
   * @param nodes
   * @param options
   * @returns
   */
  async generateWorkflowJSON(
    nodes: WorkflowNodeEntity[],
    options,
  ): Promise<WorkflowJSON> {
    const ports =
      this.encapsulateLinesService.getValidEncapsulateConnectPorts(nodes);
    const json = await this.workflowDocument.toJSON();
    const nodeIds = nodes.map(node => node.id);

    // Step 1: Generate JSON
    const defaultJSON = this.defaultJSON();
    const startNode = defaultJSON.nodes.find(
      node => node.type === StandardNodeType.Start,
    );
    const endNode = defaultJSON.nodes.find(
      node => node.type === StandardNodeType.End,
    );

    if (!startNode || !endNode) {
      throw new Error('start or end node not found');
    }

    // Step 2: Generate JSON for encapsulated nodes
    const parentId = getNodesParentId(nodes);
    const parentNodes =
      parentId === 'root'
        ? json.nodes
        : this.findSubCanvasNodeJSON(json.nodes, parentId)?.blocks || [];
    const encapsulateNodes = parentNodes.filter(node =>
      nodeIds.includes(node.id),
    );
    const parentEdges =
      parentId === 'root'
        ? json.edges
        : this.findSubCanvasNodeJSON(json.nodes, parentId)?.edges || [];
    const encapsulateEdges = parentEdges.filter(
      edge =>
        nodeIds.includes(edge.sourceNodeID) &&
        nodeIds.includes(edge.targetNodeID),
    );

    // Step 3: Connect the start end to the encapsulation node
    const { startEdges, endEdges } = this.generateStartEndEdges(
      startNode,
      endNode,
      ports,
    );

    // Step 4: Update the start end position
    if (options?.startEndRects) {
      setNodePositionByRect(startNode, options.startEndRects.start);
      setNodePositionByRect(endNode, options.startEndRects.end);
    }

    let workflowJSON = {
      nodes: [...defaultJSON.nodes, ...encapsulateNodes],
      edges: [
        ...defaultJSON.edges,
        ...encapsulateEdges,
        ...startEdges,
        ...endEdges,
      ],
    };

    // Step 5: Update variable reference relationships
    const vars = this.encapsulateVariableService.getEncapsulateVars(nodes);
    workflowJSON = this.encapsulateVariableService.updateVarsInEncapsulateJSON(
      workflowJSON,
      vars,
    );
    return workflowJSON;
  }

  /**
   * Generate subprocess nodes
   * @param param0
   * @returns
   */
  generateSubWorkflowNode = ({
    name,
    desc,
    workflowId,
    spaceId,
  }: GenerateSubWorkflowNodeOptions) => {
    const nodeMeta = this.getTemplateNodeMeta(StandardNodeType.SubWorkflow);
    return {
      data: {
        nodeMeta: {
          title: name,
          description: desc,
          icon: nodeMeta.icon,
          isImageflow: false,
        },
        inputs: {
          workflowId,
          spaceId,
          workflowVersion: this.encapsulateContext.projectId ? '' : 'v0.0.1',
        },
      },
    };
  };

  /**
   * Generate start end edge
   * @param startNode
   * @param endNode
   * @param ports
   * @returns
   */
  private generateStartEndEdges(
    startNode: WorkflowNodeJSON,
    endNode: WorkflowNodeJSON,
    ports: ConnectPortsInfo,
  ) {
    const startEdges: WorkflowEdgeJSON[] = uniqBy(
      ports.inputLines.map(line => {
        const edge = line.toJSON();
        edge.sourceNodeID = startNode.id;
        delete edge.sourcePortID;
        return edge;
      }),
      this.getCompareEdgeId,
    );

    const endEdges: WorkflowEdgeJSON[] = uniqBy(
      ports.outputLines.map(line => {
        const edge = line.toJSON();
        edge.targetNodeID = endNode.id;
        delete edge.targetPortID;
        return edge;
      }),
      this.getCompareEdgeId,
    );

    return {
      startEdges,
      endEdges,
    };
  }

  private getCompareEdgeId(edge) {
    return `${edge.sourceNodeID || ''}:${edge.sourcePortID || ''}-${
      edge.targetNodeID || ''
    }:${edge.targetPortID || ''}`;
  }

  /**
   * Default workflow json
   */
  private defaultJSON() {
    return {
      nodes: [this.generateStartNode(), this.generateEndNode()],
      edges: [],
      versions: { loop: 'v2' },
    };
  }

  /**
   * Generate start node
   */
  private generateStartNode() {
    return {
      id: '100001',
      type: StandardNodeType.Start,
      meta: {
        position: { x: 0, y: 0 },
      },
      data: {
        nodeMeta: this.getTemplateNodeMeta(StandardNodeType.Start),
        outputs: [],
      },
    };
  }

  /**
   * end node generation
   */
  private generateEndNode() {
    return {
      id: '900001',
      type: StandardNodeType.End,
      meta: {
        position: { x: 1000, y: 0 },
      },
      data: {
        nodeMeta: this.getTemplateNodeMeta(StandardNodeType.End),
        inputs: { terminatePlan: 'returnVariables', inputParameters: [] },
      },
    };
  }

  /**
   * Get the node's metadata
   */
  private getTemplateNodeMeta(type: StandardNodeType) {
    const template = this.encapsulateContext.getNodeTemplate(type);
    return template
      ? {
          title: template.title,
          subTitle: template.subTitle,
          description: template.description,
          icon: template.icon,
        }
      : {};
  }

  /**
   * Find the json corresponding to the child workflow
   * @param nodeJSONs
   * @param parentId
   * @returns
   */
  private findSubCanvasNodeJSON(
    nodeJSONs: WorkflowNodeJSON[],
    parentId: string,
  ) {
    const subCanvasNode = this.findSubCanvasSourceNode(parentId);
    return nodeJSONs.find(nodeJSON => nodeJSON.id === subCanvasNode?.id);
  }

  /**
   * Find the node corresponding to the child canvas
   * @param subCanvasId
   * @returns
   */
  private findSubCanvasSourceNode(subCanvasId: string) {
    const nodes = this.workflowDocument.getAllNodes();
    return nodes.find(node => {
      const registry = node.getNodeRegistry() as WorkflowNodeRegistry;
      const subCanvas = registry?.meta?.subCanvas;

      return subCanvas?.(node)?.canvasNode?.id === subCanvasId;
    });
  }
}
