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

import { intersection } from 'lodash-es';
import { inject, injectable, postConstruct } from 'inversify';
import { WorkflowNodePanelService } from '@flowgram-adapter/free-layout-editor';
import { type PlaygroundDragEvent } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowLinesManager,
  type WorkflowLinePortInfo,
  type WorkflowLineEntity,
  type WorkflowPortEntity,
} from '@flowgram-adapter/free-layout-editor';
import {
  type PositionSchema,
  type Disposable,
  DisposableCollection,
} from '@flowgram-adapter/common';
import { ValidationService } from '@coze-workflow/base/services';
import type { StandardNodeType } from '@coze-workflow/base';
import { Toast } from '@coze-arch/coze-design';

import { WorkflowGlobalStateEntity } from '../entities';
import { WorkflowCustomDragService } from './workflow-drag-service';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WorkflowLinesServiceProvider = Symbol(
  'WorkflowLinesServiceProvider',
);

@injectable()
export class WorkflowLinesService {
  @inject(ValidationService) private validationService: ValidationService;

  @inject(WorkflowGlobalStateEntity) globalState: WorkflowGlobalStateEntity;

  @inject(WorkflowLinesManager)
  protected readonly linesManager: WorkflowLinesManager;

  @inject(WorkflowNodePanelService)
  protected nodePanelService: WorkflowNodePanelService;

  @inject(WorkflowCustomDragService)
  protected dragService: WorkflowCustomDragService;

  protected toDispose = new DisposableCollection();

  @postConstruct()
  init() {
    this.toDispose.pushAll([this.onDragLineEnd()]);
  }

  dispose() {
    this.toDispose.dispose();
  }

  getLine(fromId?: string, toId?: string): WorkflowLineEntity | undefined {
    const allLines = this.linesManager.getAllLines();

    return allLines.find(
      line => line.from.id === fromId && line.to?.id === toId,
    );
  }

  getAllLines() {
    return this.linesManager.getAllLines();
  }

  createLine(options: WorkflowLinePortInfo) {
    return this.linesManager.createLine(options);
  }

  isError(fromId?: string, toId?: string): boolean {
    if (!fromId) {
      // No input port allowed
      return true;
    }

    const line = this.getLine(fromId, toId);

    if (!line) {
      // Output does not exist
      return false;
    }

    return this.validationService.isLineError(fromId, toId);
  }

  validateLine(fromId: string, toId: string) {
    const line = this.getLine(fromId, toId);

    line?.validate();
  }

  validateAllLine() {
    const allLines = this.linesManager.getAllLines();

    allLines.forEach(line => line.validate());
  }

  // Swap the connection between the two ports
  replaceLineByPort(
    oldPortInfo: WorkflowLinePortInfo,
    newPortInfo: WorkflowLinePortInfo,
  ) {
    const allLines = this.linesManager.getAllLines();

    const oldPortLines = allLines.filter(
      line =>
        line.info.from === oldPortInfo.from &&
        line.info.fromPort === oldPortInfo.fromPort,
    );

    const newPortLines = allLines.filter(
      line =>
        line.info.from === newPortInfo.from &&
        line.info.fromPort === newPortInfo.fromPort,
    );

    // Record the intersection of all connection endpoints
    const intersectionToPort = intersection(
      oldPortLines.map(line => line.toPort?.id),
      newPortLines.map(line => line.toPort?.id),
    );

    oldPortLines
      // If the ends of the two lines are the same, the exchange is abandoned.
      // 1. There is no need to exchange, the connection after the exchange is the same
      // 2. Two identical connections will be generated during the process, but two identical connections are not allowed in the canvas, which will cause one connection to be lost.
      .filter(
        line => !intersectionToPort.some(portId => portId === line.toPort?.id),
      )
      .forEach(line => {
        this.linesManager.replaceLine(line.info, {
          ...newPortInfo,
          to: line.info.to,
        });
      });

    newPortLines
      .filter(
        line => !intersectionToPort.some(portId => portId === line.toPort?.id),
      )
      .forEach(line => {
        this.linesManager.replaceLine(line.info, {
          ...oldPortInfo,
          to: line.info.to,
        });
      });

    this.linesManager.forceUpdate();
  }

  /** Monitor when dragging an empty line */
  private onDragLineEnd(): Disposable {
    return this.dragService.onDragLineEnd(
      async (params: {
        fromPort: WorkflowPortEntity;
        toPort?: WorkflowPortEntity;
        mousePos: PositionSchema;
        line?: WorkflowLineEntity;
        originLine?: WorkflowLineEntity;
        event: PlaygroundDragEvent;
      }) => {
        const { fromPort, toPort, mousePos, line, originLine } = params;
        if (originLine || !line) {
          return;
        }
        if (toPort) {
          return;
        }
        await this.nodePanelService.call({
          fromPort,
          toPort: undefined,
          panelPosition: mousePos,
          enableBuildLine: true,
          panelProps: {
            enableNodePlaceholder: true,
            enableScrollClose: true,
          },
          canAddNode: ({ nodeType, containerNode }) => {
            const canDropMessage = this.dragService.canDropToNode({
              dragNodeType: nodeType as StandardNodeType,
              dropNode: containerNode,
            });
            if (!canDropMessage.allowDrop) {
              Toast.warning({
                content: canDropMessage.message,
              });
            }
            return canDropMessage.allowDrop;
          },
        });
      },
    );
  }
}
