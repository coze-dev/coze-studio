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
   * 获取有效的封装连接端口
   * @param nodes 封装范围内的节点数组
   * @throws Error 输入线不符合封装规则
   * @throws Error 输出线不符合封装规则
   * @returns 封装范围内的输入和输出端口对象
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
   * 获取封装范围内的所有输入线
   * @param nodes 流程图节点数组
   * @returns 封装范围内的输入线数组
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
   * 获取封装范围内的所有输出线
   * @param nodes 流程图节点数组
   * @returns 封装范围内的输出线数组
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
   * 校验封装范围内的输入和输出线是否符合封装规则
   */
  validateEncapsulateLines(lines: WorkflowLineEntity[]): boolean {
    const isFromPortUniq =
      uniq(lines.map(_line => _line.fromPort)).length === 1;
    const isToPortUniq = uniq(lines.map(_line => _line.toPort)).length === 1;
    return isFromPortUniq || isToPortUniq;
  }

  /**
   * 创建封装连线
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
   * 创建解封线
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
      // 子画布中的连线
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

    // 内部连线
    const internalLines = this.createDecapsulateInternalLines(
      edgesGroup.internal || [],
      idsMap,
    );

    // 输入连线
    const inputLines = this.createDecapsulateInputLines(
      edgesGroup.input || [],
      node,
      idsMap,
    );

    // 输出连线
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
   * 创建解封内部连线
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
   * 创建解封输入连线
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

    // 封装多开头+封装上游多个输入 不创建连线
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
   * 创建解封输出连线
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

    // 封装多输出+封装下游多个输出 不创建连线
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
   * 创建连线
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
      // loop内的最后一根线
      line.toPort?.portID === 'loop-function-inline-input' ||
      // loop内的第一根线
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
