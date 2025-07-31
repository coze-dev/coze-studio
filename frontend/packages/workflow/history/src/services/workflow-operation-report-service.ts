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

import { snakeCase } from 'lodash-es';
import { injectable, inject } from 'inversify';
import {
  type AddOrDeleteLineOperationValue,
  type AddOrDeleteWorkflowNodeOperationValue,
  type ChangeNodeDataValue,
  FreeOperationType,
} from '@flowgram-adapter/free-layout-editor';
import { DisposableCollection } from '@flowgram-adapter/common';
import { type Operation, OperationService } from '@flowgram-adapter/common';
import { reporter } from '@coze-workflow/base';

@injectable()
export class WorkflowOperationReportService {
  @inject(OperationService)
  private readonly operationService: OperationService;

  private toDispose = new DisposableCollection();

  private lastOperation: Operation | null = null;

  init() {
    this.toDispose.pushAll([
      this.operationService.onApply((operation: Operation) => {
        if (!operation.type) {
          return;
        }

        try {
          if (!this.shouldReport(operation)) {
            return;
          }
          const message = this.getMessageByOperation(operation);
          reporter.info({ message });
        } catch (e) {
          reporter.error({
            error: e as Error,
            message: 'workflow operation report error',
          });
        }
        this.lastOperation = operation;
      }),
    ]);
  }

  dispose() {
    this.toDispose.dispose();
  }

  private getMessageByOperation(operation: Operation): string {
    const { type, value } = operation;
    const eventName = this.getEventName(type);

    if (
      type === FreeOperationType.addLine ||
      type === FreeOperationType.deleteLine
    ) {
      const {
        from,
        to = '',
        fromPort = '',
        toPort = '',
      } = value as AddOrDeleteLineOperationValue;
      return `${eventName} from ${from}${this.portToString(
        fromPort,
      )} to ${to}${this.portToString(toPort)}`;
    }

    if (
      type === FreeOperationType.addNode ||
      type === FreeOperationType.deleteNode
    ) {
      const {
        node: { id },
      } = value as AddOrDeleteWorkflowNodeOperationValue;
      return `${eventName} ${id}`;
    }

    if (this.isChangeDataType(type)) {
      const { id, path } = value as ChangeNodeDataValue;
      const message = `${eventName} node:${id} path:${path}`;
      return message;
    }

    return eventName;
  }

  private getEventName(type: string) {
    return `workflow_${snakeCase(type)}`;
  }

  private isChangeDataType(type: string) {
    return (
      type === FreeOperationType.changeNodeData || type === 'changeFormValues'
    );
  }

  private shouldReport(operation: Operation) {
    const { value, type } = operation;

    // Modify the same node and report the same attribute only once to prevent frequent editing and reporting too much
    if (
      this.isChangeDataType(type) &&
      this.lastOperation &&
      type === this.lastOperation.type
    ) {
      const { path, id } = value as ChangeNodeDataValue;
      const { path: lastPath, id: lastId } = this.lastOperation
        .value as ChangeNodeDataValue;
      if (path === lastPath && id === lastId) {
        return false;
      }
    }
    return true;
  }

  private portToString(port: string | number) {
    return port ? `:${port}` : '';
  }
}
