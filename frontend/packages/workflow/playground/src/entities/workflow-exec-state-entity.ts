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

import { type ValidateError } from '@coze-workflow/base/services';
import {
  type GetWorkFlowProcessData,
  WorkflowExeHistoryStatus,
  type NodeResult,
  type NodeEvent,
  type EventType,
} from '@coze-workflow/base/api';
import { type WorkflowExecStatus } from '@coze-workflow/base';
import { ConfigEntity } from '@flowgram-adapter/free-layout-editor';

export type NodeError = ValidateError;

export type NodeErrorMap = Map<string, NodeError[]>;

/**
 * Current process status
 */
export interface WorkflowExecState extends GetWorkFlowProcessData {
  executeId: string;
  // Is there any execution history?
  exeHistoryStatus: WorkflowExeHistoryStatus;
  /**
   * Current workflow view state
   */
  viewStatus?: WorkflowExecStatus;

  /**
   * Run Results Panel Hidden Status
   */
  resultSideSheetVisible: boolean;
  resultSideSheetLoading: boolean;

  // The version here is temporarily meaningless, just to trigger an errorMap update
  version?: number;

  // error message
  nodeErrorMap: NodeErrorMap;

  // Some errors cannot be located to specific nodes and are placed in systemError
  systemError?: string;

  // Execution ID
  executeLogId?: string;

  // Whether to run as a single node
  isSingleMode?: boolean;

  // Running project environment id
  projectId?: string;

  nodeEvents: NodeEvent[];
}

export interface NodeErrorSetting {
  showError: boolean; // Whether to display errors
}

/**
 * Process global state management (singleton)
 */
export class WorkflowExecStateEntity extends ConfigEntity<WorkflowExecState> {
  static type = 'WorkflowExecStateEntity';

  readonly nodeResultMap = new Map<string, NodeResult>();
  readonly nodeErrorSettingMap = new Map<string, NodeErrorSetting>();

  getDefaultConfig(): WorkflowExecState {
    return {
      logID: '',
      executeId: '',
      exeHistoryStatus: WorkflowExeHistoryStatus.NoHistory,
      workflowExeCost: '',
      resultSideSheetVisible: false,
      resultSideSheetLoading: false,
      nodeErrorMap: new Map(),
      nodeEvents: [],
      projectId: '',
    };
  }

  getNodeExecResult(nodeId: string): NodeResult | undefined {
    return this.nodeResultMap.get(nodeId);
  }

  setNodeExecResult(nodeId: string, result: NodeResult): void {
    this.nodeResultMap.set(nodeId, result);
  }

  get hasNodeResult() {
    return this.nodeResultMap.size > 0;
  }

  getEndNodeResult() {
    const nodeResults = Object.fromEntries(this.nodeResultMap);
    const endNodeId = Object.keys(nodeResults).find(
      key => nodeResults[key].NodeType === 'End',
    );

    if (endNodeId) {
      return this.getNodeExecResult(endNodeId);
    }
  }

  clearNodeResult(): void {
    this.nodeResultMap.clear();

    this.updateConfig({
      version: Date.now(),
    });
  }

  setNodeError(nodeId: string, nodeError: NodeError[]) {
    this.config.nodeErrorMap.set(nodeId, nodeError);

    this.updateConfig({
      version: Date.now(),
    });
  }
  /** batch setup */
  setNodeErrors(map: { [nodeId: string]: NodeError[] }) {
    Object.keys(map).forEach(nodeId => {
      const nodeError = map[nodeId];
      this.config.nodeErrorMap.set(nodeId, nodeError);
    });
    this.updateConfig({
      version: Date.now(),
    });
  }

  getNodeError(nodeId: string) {
    return this.config.nodeErrorMap.get(nodeId);
  }

  clearNodeError(nodeId: string) {
    this.config.nodeErrorMap.delete(nodeId);
  }
  clearNodeErrorMap() {
    this.config.nodeErrorMap.clear();
  }

  openSideSheet() {
    this.updateConfig({
      resultSideSheetVisible: true,
    });
  }

  closeSideSheet() {
    this.updateConfig({
      resultSideSheetVisible: false,
    });
  }

  get nodeErrors() {
    return Object.fromEntries(this.config.nodeErrorMap);
  }

  get resultSideSheetVisible() {
    return this.config.resultSideSheetVisible;
  }

  get resultSideSheetLoading() {
    return this.config.resultSideSheetLoading;
  }

  get executeLogId() {
    return this.config.executeLogId;
  }

  get logID() {
    return this.config.logID;
  }

  setNodeErrorSetting(nodeId: string, result: NodeErrorSetting): void {
    this.nodeErrorSettingMap.set(nodeId, result);
  }

  getNodeErrorSetting(nodeId: string): NodeErrorSetting | undefined {
    return this.nodeErrorSettingMap.get(nodeId);
  }

  clearNodeErrorSetting(): void {
    this.nodeErrorSettingMap.clear();
  }

  setNodeEvents(nodeEvents?: NodeEvent[]) {
    if (!nodeEvents) {
      return;
    }
    this.config.nodeEvents = nodeEvents;
  }

  getNodeEvent(eventType: EventType): NodeEvent | undefined {
    return this.config.nodeEvents.find(event => event.type === eventType);
  }

  clearNodeEvents() {
    this.config.nodeEvents = [];
  }
}
