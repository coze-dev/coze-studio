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

import { get, cloneDeep } from 'lodash-es';
import type { WorkflowEdgeJSON } from '@flowgram-adapter/free-layout-editor';

import type {
  StandardNodeType,
  WorkflowJSON,
  WorkflowNodeJSON,
} from '../../types';
import type {
  SchemaExtracted,
  SchemaExtractorConfig,
  SchemaExtractorNodeConfig,
  SchemaExtractorParser,
} from './type';
import { schemaExtractorParsers } from './parsers';
import { SchemaExtractorParserName } from './constant';
export { SchemaExtractorParserName } from './constant';

export type {
  SchemaExtractorConfig,
  SchemaExtracted,
  SchemaExtractorNodeConfig,
  ParsedVariableMergeGroups,
} from './type';

export class SchemaExtractor {
  private readonly schema: WorkflowJSON;
  private readonly parser: Record<
    SchemaExtractorParserName,
    SchemaExtractorParser
  >;
  constructor(schema: WorkflowJSON) {
    this.schema = this.flatSchema(cloneDeep(schema));
    this.parser = schemaExtractorParsers;
  }
  public extract(config: SchemaExtractorConfig): SchemaExtracted[] {
    this.bindParser(config);
    // 1. Traverse the node array in the schema and process each node
    return this.schema.nodes
      .map((node: WorkflowNodeJSON): SchemaExtracted | null => {
        // 2. Get the configuration corresponding to the node
        const nodeConfigs: SchemaExtractorNodeConfig[] = config[node.type];
        if (!nodeConfigs) {
          return null;
        }
        return {
          nodeId: node.id,
          nodeType: node.type as StandardNodeType,
          properties: this.extractNode(nodeConfigs, node.data),
        };
      })
      .filter(Boolean) as SchemaExtracted[];
  }
  private extractNode(
    nodeConfigs: SchemaExtractorNodeConfig[],
    nodeData: Record<string, unknown>,
  ): Record<string, unknown> {
    return nodeConfigs.reduce(
      (
        extractedConfig: Record<string, unknown>,
        nodeConfig: SchemaExtractorNodeConfig,
      ): Record<string, unknown> => {
        // 3. Get the attribute value according to the node configuration path
        const rawData: unknown = this.extractProperties(
          nodeData,
          nodeConfig.path,
        );
        if (nodeConfig.parser && typeof nodeConfig.parser === 'function') {
          // 4. Use the parser to convert the property value
          extractedConfig[nodeConfig.name] = nodeConfig.parser(rawData);
        }
        return extractedConfig;
      },
      {},
    );
  }
  private extractProperties(properties: Record<string, unknown>, path: string) {
    return get(properties, path);
  }
  private bindParser(config: SchemaExtractorConfig) {
    Object.entries(config).forEach(([nodeType, nodeConfigs]) => {
      nodeConfigs.forEach(nodeConfig => {
        if (!nodeConfig.parser) {
          nodeConfig.parser = SchemaExtractorParserName.DEFAULT;
        }
        if (typeof nodeConfig.parser === 'string') {
          nodeConfig.parser = this.parser[nodeConfig.parser];
        }
      });
    });
  }
  private getEdgeID(edge: WorkflowEdgeJSON): string {
    const from = edge.sourceNodeID;
    const to = edge.targetNodeID;
    const fromPort = edge.sourcePortID;
    const toPort = edge.targetPortID;
    return `${from}_${fromPort || ''}-${to || ''}_${toPort || ''}`;
  }
  private flatSchema(
    json: WorkflowJSON = { nodes: [], edges: [] },
  ): WorkflowJSON {
    const rootNodes = json.nodes ?? [];
    const rootEdges = json.edges ?? [];

    const flattenNodeJSONs: WorkflowNodeJSON[] = [...rootNodes];
    const flattenEdgeJSONs: WorkflowEdgeJSON[] = [...rootEdges];

    // To support multi-layer structures, the following section is changed to recursive
    rootNodes.forEach(nodeJSON => {
      const { blocks, edges } = nodeJSON;
      if (blocks) {
        flattenNodeJSONs.push(...blocks);
        const blockIDs: string[] = [];
        blocks.forEach(block => {
          blockIDs.push(block.id);
        });
        delete nodeJSON.blocks;
      }
      if (edges) {
        flattenEdgeJSONs.push(...edges);
        const edgeIDs: string[] = [];
        edges.forEach(edge => {
          const edgeID = this.getEdgeID(edge);
          edgeIDs.push(edgeID);
        });
        delete nodeJSON.edges;
      }
    });

    const flattenSchema: WorkflowJSON = {
      nodes: flattenNodeJSONs,
      edges: flattenEdgeJSONs,
    };

    return flattenSchema;
  }
}
