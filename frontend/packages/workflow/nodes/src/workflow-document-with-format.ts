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

import { injectable, multiInject, optional } from 'inversify';
import {
  WorkflowDocument,
  FlowNodeBaseType,
  WorkflowLineEntity,
  type WorkflowNodeEntity,
  type WorkflowEdgeJSON,
  type WorkflowJSON,
  type WorkflowNodeJSON,
  WorkflowJSONFormatContribution,
} from '@flowgram-adapter/free-layout-editor';
import { compose } from '@flowgram-adapter/common';

@injectable()
export class WorkflowDocumentWithFormat extends WorkflowDocument {
  @multiInject(WorkflowJSONFormatContribution)
  @optional()
  protected jsonFormats: WorkflowJSONFormatContribution[] = [];

  /**
   * load from data
   * @param json
   */
  fromJSON(json: Partial<WorkflowJSON>, fireRender = true): void {
    const { flattenJSON, nodeBlocks, nodeEdges } = this.flatJSON(json);
    const formattedJSON: WorkflowJSON = this.formatWorkflowJSON<WorkflowJSON>(
      flattenJSON,
      'formatOnInit',
      this,
    );
    const nestedJSON = this.nestJSON(formattedJSON, nodeBlocks, nodeEdges);
    super.fromJSON(nestedJSON, fireRender);
  }

  private _formatCache = new Map<string | number | symbol, any>();

  /**
   * Convert json
   * @param json
   * @param formatKey
   * @param args
   * @protected
   */
  protected formatWorkflowJSON<T>(
    json: T,
    formatKey: keyof WorkflowJSONFormatContribution,
    ...args: any[]
  ): T {
    if (this._formatCache.has(formatKey)) {
      return this._formatCache.get(formatKey)(json, ...args);
    }
    const fns: any[] = this.jsonFormats
      .map(format =>
        format[formatKey] ? format[formatKey]!.bind(format) : undefined,
      )
      .filter(f => Boolean(f));
    const fn = compose<T>(...fns);
    this._formatCache.set(formatKey, fn);
    return fn(json, ...args);
  }

  /**
   * Create process node
   * @param json
   */
  createWorkflowNode(
    json: WorkflowNodeJSON,
    isClone?: boolean,
    parentId?: string,
  ): WorkflowNodeEntity {
    json = this.formatWorkflowJSON<WorkflowNodeJSON>(
      json,
      'formatNodeOnInit',
      this,
      isClone,
    );
    return super.createWorkflowNode(json, isClone, parentId);
  }

  toNodeJSON(node: WorkflowNodeEntity): WorkflowNodeJSON {
    const json = super.toNodeJSON(node);
    // format
    const formattedJSON = this.formatWorkflowJSON<WorkflowNodeJSON>(
      json,
      'formatNodeOnSubmit',
      this,
      node,
    );
    return formattedJSON;
  }

  /**
   * export data
   */
  toJSON(): WorkflowJSON {
    const rootJSON = this.toNodeJSON(this.root);
    const json = this.formatWorkflowJSON(
      {
        nodes: rootJSON.blocks ?? [],
        edges: rootJSON.edges ?? [],
      },
      'formatOnSubmit',
      this,
    );
    return json;
  }

  private getEdgeID(edge: WorkflowEdgeJSON): string {
    return WorkflowLineEntity.portInfoToLineId({
      from: edge.sourceNodeID,
      to: edge.targetNodeID,
      fromPort: edge.sourcePortID,
      toPort: edge.targetPortID,
    });
  }

  /**
   * Flatten the tree-shaped JSON structure and extract the structure information to the map.
   */
  private flatJSON(json: Partial<WorkflowJSON> = { nodes: [], edges: [] }): {
    flattenJSON: WorkflowJSON;
    nodeBlocks: Map<string, string[]>;
    nodeEdges: Map<string, string[]>;
  } {
    const nodeBlocks = new Map<string, string[]>();
    const nodeEdges = new Map<string, string[]>();
    const rootNodes = json.nodes ?? [];
    const rootEdges = json.edges ?? [];
    const flattenNodeJSONs: WorkflowNodeJSON[] = [...rootNodes];
    const flattenEdgeJSONs: WorkflowEdgeJSON[] = [...rootEdges];

    const rootBlockIDs: string[] = rootNodes.map(node => node.id);
    const rootEdgeIDs: string[] = rootEdges.map(edge => this.getEdgeID(edge));

    nodeBlocks.set(FlowNodeBaseType.ROOT, rootBlockIDs);
    nodeEdges.set(FlowNodeBaseType.ROOT, rootEdgeIDs);

    // To support multi-layer structures, the following section is changed to recursive
    rootNodes.forEach(nodeJSON => {
      const { blocks, edges } = nodeJSON;
      if (blocks) {
        flattenNodeJSONs.push(...blocks);
        const blockIDs: string[] = [];
        blocks.forEach(block => {
          blockIDs.push(block.id);
        });
        nodeBlocks.set(nodeJSON.id, blockIDs);
        delete nodeJSON.blocks;
      }
      if (edges) {
        flattenEdgeJSONs.push(...edges);
        const edgeIDs: string[] = [];
        edges.forEach(edge => {
          const edgeID = this.getEdgeID(edge);
          edgeIDs.push(edgeID);
        });
        nodeEdges.set(nodeJSON.id, edgeIDs);
        delete nodeJSON.edges;
      }
    });

    const flattenJSON: WorkflowJSON = {
      nodes: flattenNodeJSONs,
      edges: flattenEdgeJSONs,
    };

    return {
      flattenJSON,
      nodeBlocks,
      nodeEdges,
    };
  }

  /**
   * Layering JSON
   */
  private nestJSON(
    flattenJSON: WorkflowJSON,
    nodeBlocks: Map<string, string[]>,
    nodeEdges: Map<string, string[]>,
  ): WorkflowJSON {
    const nestJSON: WorkflowJSON = {
      nodes: [],
      edges: [],
    };
    const nodeMap = new Map<string, WorkflowNodeJSON>();
    const edgeMap = new Map<string, WorkflowEdgeJSON>();
    const rootBlockSet = new Set<string>(
      nodeBlocks.get(FlowNodeBaseType.ROOT) ?? [],
    );
    const rootEdgeSet = new Set<string>(
      nodeEdges.get(FlowNodeBaseType.ROOT) ?? [],
    );

    // Construct cache
    flattenJSON.nodes.forEach(nodeJSON => {
      nodeMap.set(nodeJSON.id, nodeJSON);
    });

    flattenJSON.edges.forEach(edgeJSON => {
      const edgeID = this.getEdgeID(edgeJSON);
      edgeMap.set(edgeID, edgeJSON);
    });

    // Restore hierarchical data
    flattenJSON.nodes.forEach(nodeJSON => {
      if (rootBlockSet.has(nodeJSON.id)) {
        nestJSON.nodes.push(nodeJSON);
      }
      // Recovery blocks
      if (nodeBlocks.has(nodeJSON.id)) {
        const blockIDs = nodeBlocks.get(nodeJSON.id)!;
        const blockJSONs: WorkflowNodeJSON[] = blockIDs
          .map(blockID => nodeMap.get(blockID)!)
          .filter(Boolean);
        nodeJSON.blocks = blockJSONs;
      }
      // Restore edges
      if (nodeEdges.has(nodeJSON.id)) {
        const edgeIDs = nodeEdges.get(nodeJSON.id)!;
        const edgeJSONs: WorkflowEdgeJSON[] = edgeIDs
          .map(edgeID => edgeMap.get(edgeID)!)
          .filter(Boolean);
        nodeJSON.edges = edgeJSONs;
      }
    });

    flattenJSON.edges.forEach(edgeJSON => {
      const edgeID = this.getEdgeID(edgeJSON);
      if (rootEdgeSet.has(edgeID)) {
        nestJSON.edges.push(edgeJSON);
      }
    });

    return nestJSON;
  }
}
