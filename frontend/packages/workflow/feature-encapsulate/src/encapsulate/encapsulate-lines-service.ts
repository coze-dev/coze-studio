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

import { groupBy, uniq } from 'lodash-es';
import { inject, injectable } from 'inversify';
import { type WorkflowJSON } from '@coze-workflow/base';
import {
  type WorkflowLineEntity,
  WorkflowNodeLinesData,
  type WorkflowPortEntity,
  type WorkflowNodeEntity,
  WorkflowLinesManager,
  type WorkflowEdgeJSON,
  type WorkflowLinePortInfo,
} from '@flowgram-adapter/free-layout-editor';

import { isNodesInSubCanvas } from '../utils/subcanvas';
import { type ConnectPortsInfo } from './types';

@injectable()
export class EncapsulateLinesService {
  @inject(WorkflowLinesManager) declare linesManager: WorkflowLinesManager;

  /**
   * Get a valid encapsulation connection port
   * @Param nodes Encapsulated array of nodes
   * @throws Error input line does not conform to encapsulation rules
   * @Throws Error Output line does not conform to encapsulation rules
   * @Returns Encapsulated input and output port objects
   */
  getValidEncapsulateConnectPorts(
    nodes: WorkflowNodeEntity[],
  ): ConnectPortsInfo {
    const inputLines = this.getEncapsulateNodesInputLines(nodes);
    const outputLines = this.getEncapsulateNodesOutputLines(nodes);

    if (!this.validateEncapsulateLines(inputLines)) {
      throw new Error('输入线不符合封装规则');
    }

    if (!this.validateEncapsulateLines(outputLines)) {
      throw new Error('输出线不符合封装规则');
    }

    return {
      inputLines,
      outputLines,
      fromPorts: uniq(inputLines.map(_line => _line.fromPort)),
      toPorts: uniq(
        outputLines
          .map(_line => _line.toPort)
          .filter(Boolean) as WorkflowPortEntity[],
      ),
    };
  }

  /**
   * Connects the specified ports to the given node.
   *
   * @param portInfo - Information about the ports to be connected.
   * @param node - The node to which the ports will be connected.
   *
   * This method iterates over the `fromPorts` and `toPorts` arrays, creating lines
   * between each port and the specified node using the `linesManager.createLine` method.
   */

  connectPortsToNode(portInfo: ConnectPortsInfo, node: WorkflowNodeEntity) {
    const { fromPorts, toPorts } = portInfo;

    fromPorts.forEach(_fromPort => {
      this.linesManager.createLine({
        from: _fromPort.node.id,
        fromPort: _fromPort.portID,
        to: node.id,
      });
    });

    toPorts.forEach(_toPort => {
      this.linesManager.createLine({
        from: node.id,
        to: _toPort.node.id,
        toPort: _toPort.portID,
      });
    });
  }

  /**
   * Get all input lines in the package range
   * @Param nodes flowchart node array
   * @Returns array of input lines in the encapsulated range
   */
  getEncapsulateNodesInputLines(
    nodes: WorkflowNodeEntity[],
  ): WorkflowLineEntity[] {
    return uniq(
      nodes
        .map(_node => _node.getData(WorkflowNodeLinesData).inputLines)
        .flat(),
    ).filter(
      _line =>
        _line.from &&
        !nodes.includes(_line.from) &&
        (isNodesInSubCanvas(nodes) || !this.isSubCanvasLinkLine(_line)),
    );
  }

  /**
   * Get all output lines in the package range
   * @Param nodes flowchart node array
   * @Returns array of output lines in the encapsulated range
   */
  getEncapsulateNodesOutputLines(
    nodes: WorkflowNodeEntity[],
  ): WorkflowLineEntity[] {
    return uniq(
      nodes
        .map(_node => _node.getData(WorkflowNodeLinesData).outputLines)
        .flat(),
    ).filter(
      _line =>
        _line.to &&
        !nodes.includes(_line.to) &&
        (isNodesInSubCanvas(nodes) || !this.isSubCanvasLinkLine(_line)),
    );
  }

  /**
   * Verify that the input and output lines within the package range comply with the package rules
   */
  validateEncapsulateLines(lines: WorkflowLineEntity[]): boolean {
    const isFromPortUniq =
      uniq(lines.map(_line => _line.fromPort)).length === 1;
    const isToPortUniq = uniq(lines.map(_line => _line.toPort)).length === 1;
    return isFromPortUniq || isToPortUniq;
  }

  /**
   * Create encapsulation connection
   * @param ports
   * @param subFlowNode
   * @returns
   */
  createEncapsulateLines(
    ports: ConnectPortsInfo,
    subFlowNode: WorkflowNodeEntity,
  ) {
    const inputLines: WorkflowLineEntity[] = [];
    const outputLines: WorkflowLineEntity[] = [];
    ports.inputLines.forEach(line => {
      const inputLine = this.linesManager.createLine({
        from: line.from.id,
        fromPort: line.fromPort.portID,
        to: subFlowNode.id,
      });

      if (!inputLine) {
        throw new Error('create input line failed');
      }
      inputLines.push(inputLine);
    });

    ports.outputLines.forEach(line => {
      if (!line.to) {
        return;
      }

      const outputLine = this.linesManager.createLine({
        from: subFlowNode.id,
        to: line.to.id,
        toPort: line.toPort?.portID,
      });

      if (!outputLine) {
        throw new Error('create output line failed');
      }

      outputLines.push(outputLine);
    });

    return {
      inputLines,
      outputLines,
    };
  }

  /**
   * Create unsealing line
   * @param options
   */
  createDecapsulateLines(options: {
    node: WorkflowNodeEntity;
    workflowJSON: WorkflowJSON;
    startNodeId: string;
    endNodeId: string;
    idsMap: Map<string, string>;
  }) {
    const { node, startNodeId, endNodeId, idsMap, workflowJSON } = options;
    const edges = [
      ...workflowJSON.edges,
      // Lines in the sub-canvas
      ...workflowJSON.nodes
        .map(n => n.edges)
        .filter(Boolean)
        .flat(),
    ] as WorkflowEdgeJSON[];

    const edgesGroup = groupBy(edges, edge => {
      if (edge.sourceNodeID === startNodeId) {
        return 'input';
      }
      if (edge.targetNodeID === endNodeId) {
        return 'output';
      }

      return 'internal';
    });

    // interconnect
    const internalLines = this.createDecapsulateInternalLines(
      edgesGroup.internal || [],
      idsMap,
    );

    // input connection
    const inputLines = this.createDecapsulateInputLines(
      edgesGroup.input || [],
      node,
      idsMap,
    );

    // output connection
    const outputLines = this.createDecapsulateOutputLines(
      edgesGroup.output || [],
      node,
      idsMap,
    );

    return {
      inputLines,
      outputLines,
      internalLines,
    };
  }

  /**
   * Create an unblocked internal connection
   * @param internalEdges
   * @param idsMap
   * @returns
   */
  private createDecapsulateInternalLines(
    internalEdges: WorkflowEdgeJSON[],
    idsMap: Map<string, string>,
  ) {
    const createdLines: WorkflowLineEntity[] = [];
    internalEdges.forEach(edge => {
      if (!idsMap.has(edge.sourceNodeID) || !idsMap.has(edge.targetNodeID)) {
        return;
      }

      const line = {
        from: idsMap.get(edge.sourceNodeID) as string,
        to: idsMap.get(edge.targetNodeID) as string,
        fromPort: edge.sourcePortID,
        toPort: edge.targetPortID,
      };

      if (line.fromPort === 'loop-function-inline-output') {
        line.from = `LoopFunction_${line.from}`;
      }

      if (line.toPort === 'loop-function-inline-input') {
        line.to = `LoopFunction_${line.to}`;
      }

      if (line.fromPort === 'batch-function-inline-output') {
        line.from = `BatchFunction_${line.from}`;
      }

      if (line.toPort === 'batch-function-inline-input') {
        line.to = `BatchFunction_${line.to}`;
      }

      this.createLine(line, createdLines);
    });
    return createdLines;
  }

  /**
   * Create an unsealed input connection
   * @param inputEdges
   * @param node
   * @param idsMap
   * @returns
   */
  private createDecapsulateInputLines(
    inputEdges: WorkflowEdgeJSON[],
    node: WorkflowNodeEntity,
    idsMap: Map<string, string>,
  ) {
    const createdLines: WorkflowLineEntity[] = [];
    const { inputLines } = node.getData(WorkflowNodeLinesData);

    // Encapsulate multiple starts + encapsulate multiple upstream inputs, do not create connections
    if (inputLines.length > 1 && inputEdges.length > 1) {
      return createdLines;
    }

    inputLines.forEach(inputLine => {
      inputEdges.forEach(edge => {
        if (!idsMap.has(edge.targetNodeID)) {
          return;
        }

        this.createLine(
          {
            from: inputLine.from.id,
            fromPort: inputLine.fromPort.portID,
            to: idsMap.get(edge.targetNodeID) as string,
            toPort: edge.targetPortID,
          },
          createdLines,
        );
      });
    });

    return createdLines;
  }

  /**
   * Create an unsealed output connection
   * @param outputEdges
   * @param node
   * @param idsMap
   * @returns
   */
  private createDecapsulateOutputLines(
    outputEdges: WorkflowEdgeJSON[],
    node: WorkflowNodeEntity,
    idsMap: Map<string, string>,
  ) {
    const createdLines: WorkflowLineEntity[] = [];
    const { outputLines } = node.getData(WorkflowNodeLinesData);

    // Encapsulate multiple outputs + Encapsulate multiple downstream outputs without creating wires
    if (outputLines.length > 1 && outputEdges.length > 1) {
      return createdLines;
    }

    outputLines.forEach(outputLine => {
      outputEdges.forEach(edge => {
        if (!idsMap.has(edge.sourceNodeID)) {
          return;
        }

        this.createLine(
          {
            from: idsMap.get(edge.sourceNodeID) as string,
            fromPort: edge.sourcePortID,
            to: outputLine.to?.id,
            toPort: outputLine.toPort?.portID,
          },
          createdLines,
        );
      });
    });

    return createdLines;
  }

  /**
   * Create a connection
   * @param info
   * @param createdLines
   */
  private createLine(
    info: WorkflowLinePortInfo,
    createdLines?: WorkflowLineEntity[],
  ) {
    const line = this.linesManager.createLine(info);

    if (line && createdLines) {
      createdLines.push(line);
    }
  }

  private isSubCanvasLinkLine(line: WorkflowLineEntity): boolean {
    if (
      // The last wire in the loop
      line.toPort?.portID === 'loop-function-inline-input' ||
      // The first wire in the loop
      line.fromPort.portID === 'loop-function-inline-output'
    ) {
      return true;
    }
    if (
      line.toPort?.portID === 'batch-function-inline-input' ||
      line.fromPort.portID === 'batch-function-inline-output'
    ) {
      return true;
    }
    if (
      line.fromPort.portID === 'loop-output-to-function' &&
      line.toPort?.portID === 'loop-function-input'
    ) {
      return true;
    }
    if (
      line.fromPort.portID === 'batch-output-to-function' &&
      line.toPort?.portID === 'batch-function-input'
    ) {
      return true;
    }
    return false;
  }
}
