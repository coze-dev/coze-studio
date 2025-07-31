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

/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/naming-convention */
import { omit } from 'lodash-es';
import { inject, injectable, postConstruct } from 'inversify';
import { type FeedbackStatus } from '@flowgram-adapter/free-layout-editor';
import { Playground } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  WorkflowLinesManager,
} from '@flowgram-adapter/free-layout-editor';
import { Emitter } from '@flowgram-adapter/common';
import { workflowApi } from '@coze-workflow/base/api';
import {
  type GetWorkFlowProcessData,
  NodeExeStatus,
  type NodeResult,
  WorkflowExeStatus,
} from '@coze-workflow/base/api';
import { reporter } from '@coze-arch/logger';
import { sleep } from '@coze-arch/bot-utils';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';

import {
  WorkflowExecStateEntity,
  WorkflowExecStatus,
  WorkflowGlobalStateEntity,
  WorkflowTestFormStateEntity,
} from '../entities';
import { type TestFormDefaultValue } from '../components/test-run/types';
import { START_NODE_ID } from '../components/test-run/constants';
import { WorkflowOperationService } from './workflow-operation-service';
import { TestRunReporterService } from './test-run-reporter-service';
const LOOP_GAP_TIME = 300;

export enum TestRunState {
  /** vacant state */
  Idle = 'idle',
  /** in progress */
  Executing = 'executing',
  /** cancel */
  Canceled = 'canceled',
  /** pause */
  Paused = 'paused',
  /** success */
  Succeed = 'succeed',
  // fail
  Failed = 'failed',
}

const ExecuteStatusToTestRunStateMap = {
  [WorkflowExeStatus.Cancel]: TestRunState.Canceled,
  [WorkflowExeStatus.Fail]: TestRunState.Failed,
  [WorkflowExeStatus.Success]: TestRunState.Succeed,
};

export interface TestRunResultInfo {
  // execution id
  executeId?: string;
}

interface TestRunOneNodeOptions {
  nodeId: string;
  input?: Record<string, string>;
  batch?: Record<string, string>;
  setting?: Record<string, string>;
  botId?: string;
  /** Whether to choose the application */
  useProject?: boolean;
}

/**
 * Workflow execution
 */
@injectable()
export class WorkflowRunService {
  @inject(WorkflowDocument) protected document: WorkflowDocument;
  @inject(WorkflowGlobalStateEntity)
  readonly globalState: WorkflowGlobalStateEntity;
  @inject(WorkflowExecStateEntity) readonly execState: WorkflowExecStateEntity;
  @inject(WorkflowTestFormStateEntity)
  readonly testFormState: WorkflowTestFormStateEntity;
  @inject(WorkflowLinesManager)
  protected readonly linesManager: WorkflowLinesManager;
  @inject(WorkflowOperationService)
  protected readonly operationService: WorkflowOperationService;
  @inject(TestRunReporterService)
  protected readonly reporter: TestRunReporterService;

  @inject(Playground) protected playground: Playground;

  protected readonly testRunStateEmitter = new Emitter<{
    prevState: TestRunState;
    curState: TestRunState;
  }>();
  readonly onTestRunStateChange = this.testRunStateEmitter.event;

  private _testRunState: TestRunState = TestRunState.Idle;

  public get testRunState() {
    return this._testRunState;
  }

  private setTestRunState(state: TestRunState) {
    if (state === this.testRunState) {
      return;
    }
    this.testRunStateEmitter.fire({
      prevState: this.testRunState,
      curState: state,
    });

    this._testRunState = state;
  }

  @postConstruct()
  protected init(): void {
    /**
     * Triggered when the canvas is destroyed
     */
    this.playground.toDispose.onDispose(() => this.dispose());

    this.onTestRunStateChange(({ prevState, curState }) => {
      // Monitor state changes and report testrun results
      this.reportTestRunResult(prevState, curState);
    });
  }

  dispose() {
    /** Canvas destroyed, clearing all testForm cached data */
    this.testFormState.clearFormData();
    this.testFormState.clearTestFormDefaultValue();
    /** Thaw test run on destruction */
    this.testFormState.unfreezeTestRun();
    // Clear dry running state
    this.clearTestRun();
  }

  clearTestRun = () => {
    this.clearTestRunResult();
    this.clearTestRunState();
  };

  clearTestRunResult = () => {
    this.testFormState.unfreezeTestRun();
    this.globalState.viewStatus = WorkflowExecStatus.DEFAULT;
    // Clear the node results to avoid echo when the test runs
    if (this.execState.hasNodeResult) {
      this.execState.clearNodeResult();
    }
    this.execState.clearNodeErrorMap();
    this.execState.updateConfig({
      executeLogId: undefined,
      systemError: undefined,
      isSingleMode: undefined,
      executeId: '',
    });
    this.execState.clearNodeEvents();
  };

  /**
   * Clear dry running state
   */
  clearTestRunState = () => {
    this.setTestRunState(TestRunState.Idle);
  };

  cancelTestRun = async () => {
    const { executeId } = this.execState.config;
    sendTeaEvent(EVENT_NAMES.workflow_testrun_result_front, {
      space_id: this.globalState.spaceId,
      workflow_id: this.globalState.workflowId,
      testrun_id: executeId || '',
      action: 'manual_end',
    });
    try {
      await workflowApi.CancelWorkFlow({
        execute_id: executeId || '',
        workflow_id: this.globalState.workflowId,
        space_id: this.globalState.spaceId,
      });
      // eslint-disable-next-line no-useless-catch
    } catch (e) {
      throw e;
    } finally {
      // Whether the cancellation is successful or not, if it is cancelled in the suspended state, the rotation needs to be resumed.
      this.continueTestRun();
    }
  };

  updateExecuteState = ({
    nodeResults,
    executeStatus,
    executeId,
    reason,
    projectId,
    nodeEvents,
  }: GetWorkFlowProcessData): void => {
    // Update the status of each node
    if (nodeResults && nodeResults.length) {
      nodeResults.forEach((nodeResult: NodeResult) => {
        const { nodeId } = nodeResult;
        if (nodeId) {
          this.execState.setNodeExecResult(nodeId, nodeResult);
          // Update the line state of a node
          const currentLines = this.linesManager
            .getAllLines()
            .filter(line => line?.to?.id === nodeResult.nodeId);

          currentLines.forEach(currentLine => {
            const fromNodeStatus = nodeResults.find(
              node => node.nodeId === currentLine.from.id,
            )?.nodeStatus;

            currentLine.processing = Boolean(
              nodeResult.nodeStatus === NodeExeStatus.Running &&
                (fromNodeStatus === NodeExeStatus.Success ||
                  fromNodeStatus === NodeExeStatus.Running),
            );
          });

          // update node error
          const errorLevel = nodeResult.errorLevel?.toLocaleLowerCase() || '';
          if (['error', 'warning', 'pending'].includes(errorLevel || '')) {
            this.execState.setNodeError(nodeId, [
              {
                nodeId,
                errorInfo: nodeResult.errorInfo || '',
                errorLevel: errorLevel as FeedbackStatus,
                errorType: 'node',
              },
            ]);
          }
        }
      });
    }

    this.execState.setNodeEvents(nodeEvents);

    this.execState.updateConfig({
      projectId,
      executeLogId: executeId,
      // The reason field is only valid if the run result is cancel or fail
      systemError:
        executeStatus &&
        [WorkflowExeStatus.Cancel, WorkflowExeStatus.Fail].includes(
          executeStatus,
        )
          ? reason
          : '',
    });
  };

  /**
   * Obtain execution results and preprocess the data returned by the service.
   * Can support fetching with execution ID, or directly passing data back to the service
   */
  runProcess = async ({
    executeId,
    processResp,
    subExecuteId,
  }: {
    executeId?: string;
    processResp?: GetWorkFlowProcessData;
    subExecuteId?: string;
  }): Promise<GetWorkFlowProcessData> => {
    const data = processResp
      ? processResp
      : (await this.operationService.getProcess(executeId, subExecuteId)).data;

    // An ancient bug, the backend returns Warn, and the front-end consumes Warning. Changing the code has too much impact, so do the conversion here.
    data?.nodeResults?.forEach(node => {
      if (node.errorLevel === 'Warn') {
        node.errorLevel = 'warning';
      }
      try {
        if (node.batch) {
          const batchResults = JSON.parse(node.batch);
          node.batch = JSON.stringify(
            batchResults.map(d => ({
              ...d,
              errorLevel: d.errorLevel === 'Warn' ? 'warning' : d.errorLevel,
            })),
          );
        }
      } catch (e) {
        console.error(e);
      }
    });

    return data || {};
  };

  // Pause test run
  pauseTestRun = () => {
    this.setTestRunState(TestRunState.Paused);
  };

  // Continue the test run
  continueTestRun = () => {
    if (this.testRunState === TestRunState.Paused) {
      this.setTestRunState(TestRunState.Executing);
    }
  };

  protected waitContinue = async () => {
    if (this.testRunState !== TestRunState.Paused) {
      return;
    }
    return new Promise(resolve => {
      this.onTestRunStateChange(({ curState }) => {
        if (curState !== TestRunState.Paused) {
          resolve(true);
        }
      });
    });
  };

  // Copy the original logic and poll every 300ms
  loop = async (executeId?: string) => {
    const result = await this.runProcess({ executeId });
    this.execState.updateConfig(result || {});
    this.updateExecuteState(result);

    if (result?.executeStatus !== WorkflowExeStatus.Running) {
      return result?.executeStatus;
    }

    await Promise.all([sleep(LOOP_GAP_TIME), this.waitContinue()]);

    return this.loop(executeId);
  };

  finishProcess = () => {
    this.testFormState.unfreezeTestRun();
    this.globalState.viewStatus = WorkflowExecStatus.DONE;
    if (!this.globalState.isViewHistory) {
      // Refresh the publishable state based on practice run results
      this.globalState.reload();
    }
  };

  /* Report the test run results to count the success rate in the store */
  reportTestRunResult = (prevState: TestRunState, curState: TestRunState) => {
    const { executeId, isSingleMode } = this.execState.config;

    // Single node mode does not require statistics
    if (isSingleMode) {
      return;
    }

    if (![TestRunState.Succeed, TestRunState.Failed].includes(curState)) {
      return;
    }
    /* success */
    if (curState === TestRunState.Succeed) {
      sendTeaEvent(EVENT_NAMES.workflow_testrun_result_front, {
        space_id: this.globalState.spaceId,
        workflow_id: this.globalState.workflowId,
        testrun_id: executeId,
        action: 'testrun_end',
        results: 'success',
      });
    }

    if (curState === TestRunState.Failed) {
      /* Trigger failed */
      if (prevState === TestRunState.Idle) {
        sendTeaEvent(EVENT_NAMES.workflow_testrun_result_front, {
          space_id: this.globalState.spaceId,
          workflow_id: this.globalState.workflowId,
          action: 'testrun_end',
          results: 'fail',
          fail_end: 'server_end',
          errtype: 'trigger_error',
        });
      }
      /* Failed to run */
      sendTeaEvent(EVENT_NAMES.workflow_testrun_result_front, {
        space_id: this.globalState.spaceId,
        workflow_id: this.globalState.workflowId,
        testrun_id: executeId,
        action: 'testrun_end',
        results: 'fail',
        fail_end: 'server_end',
        errtype: 'run_error',
      });
    }
  };

  /**
   * Run test run
   */
  testRun = async (
    input?: Record<string, string>,
    botId?: string,
    /** Is the current selection an application? */
    useProject?: boolean,
  ) => {
    if (this.globalState.config.saving) {
      return;
    }
    this.testFormState.freezeTestRun(START_NODE_ID);

    let executeStatus;
    let executeId = '';

    try {
      this.execState.closeSideSheet();
      // Update view to running
      this.globalState.viewStatus = WorkflowExecStatus.EXECUTING;
      const baseParam: {
        workflow_id: string;
        space_id: string;
        bot_id?: string;
        project_id?: string;
      } = {
        workflow_id: this.globalState.workflowId,
        space_id: this.globalState.spaceId,
      };
      /** There is a variable node or a canvas with a variable node subprocess that needs to be passed bot_id, the same level as input*/
      if (botId) {
        const botIdKey = useProject ? 'project_id' : 'bot_id';
        baseParam[botIdKey] = botId;
      }
      // If it is within the project, the projectId must be passed
      if (this.globalState.projectId && !baseParam.project_id) {
        baseParam.project_id = this.globalState.projectId;
      }

      const result = await this.operationService
        .testRun({ baseParam, input })
        .catch(e => {
          sendTeaEvent(EVENT_NAMES.workflow_testrun_result_front, {
            space_id: this.globalState.spaceId,
            workflow_id: this.globalState.workflowId,
            action: 'testrun_end',
            results: 'fail',
            fail_end: 'server_end',
            errtype: 'trigger_error',
          });
          throw { ...e, errtype: 'trigger_error' };
        });

      executeId = result?.execute_id || '';
      // There is an execution id, the test ran successfully
      if (executeId) {
        this.execState.updateConfig({
          executeId,
        });
        this.setTestRunState(TestRunState.Executing);
        executeStatus = await this.loop(executeId);
        this.finishProcess();
      }
      this.reporter.runEnd({
        testrun_type: 'flow',
        testrun_result:
          this.reporter.utils.executeStatus2TestRunResult(executeStatus),
        execute_id: executeId,
      });
    } catch (error) {
      executeStatus = WorkflowExeStatus.Fail;

      this.clearTestRunResult();
      this.execState.updateConfig({
        systemError: error.msg || error.message,
      });
      this.reporter.runEnd({
        testrun_type: 'flow',
        testrun_result: 'error',
      });
    } finally {
      // Failed to open pop-up window
      if (executeStatus === WorkflowExeStatus.Fail) {
        this.execState.openSideSheet();
      }

      // After running, regardless of success, restore the inPluginUpdated value to avoid testrun all the time.
      this.globalState.inPluginUpdated = false;
      this.setTestRunState(ExecuteStatusToTestRunStateMap[executeStatus]);
    }
  };

  /**
   * Get execution history data
   */
  getProcessResult = async (config: {
    /** Whether to display node results */
    showNodeResults?: boolean;
    /** Specify the execution ID, if not, the last run result will be displayed */
    executeId?: string;
    /** Direct result server level return */
    processResp?: GetWorkFlowProcessData;
    /** subprocess execution id */
    subExecuteId?: string;
  }) => {
    const { showNodeResults, executeId, processResp, subExecuteId } = config;

    try {
      const result = await this.runProcess({
        executeId,
        processResp,
        subExecuteId,
      });

      this.execState.updateConfig(omit(result, 'nodeEvents'));

      if (showNodeResults) {
        /**
         * Only synchronizes the resulting data to the node, but does not change global.config.info. Status
         * Otherwise, the result of the last test run will affect whether the current process can be released
         * This state can only be modified by real actions such as real test runs, back-end data, etc
         */
        this.globalState.viewStatus = WorkflowExecStatus.DONE;
        this.updateExecuteState(omit(result, 'nodeEvents'));
      }
      return result;
    } catch (e) {
      reporter.errorEvent({
        eventName: 'workflow_get_process_result_fail',
        namespace: 'workflow',
        error: e,
      });
      throw e;
    }
  };

  getViewStatus() {
    return this.globalState.viewStatus;
  }

  /**
   * Get the node corresponding to the current test form schema
   */
  getTestFormNode() {
    const schema = this.testFormState.formSchema;
    if (!schema || !schema.id) {
      return null;
    }
    return this.document.getNode(schema.id) || null;
  }

  /**
   * single node operation
   */
  async testRunOneNode(options: TestRunOneNodeOptions) {
    const { nodeId, input, batch, setting, botId, useProject } = options;
    if (this.globalState.config.saving) {
      return;
    }
    this.execState.updateConfig({
      isSingleMode: true,
    });
    this.testFormState.freezeTestRun(nodeId);
    this.execState.closeSideSheet();

    let executeStatus;

    try {
      this.globalState.viewStatus = WorkflowExecStatus.EXECUTING;

      const botIdParams = {};
      if (botId) {
        if (useProject) {
          Object.assign(botIdParams, { project_id: botId });
        } else {
          Object.assign(botIdParams, { bot_id: botId });
        }
      }

      // Within the project, project_id is used by default
      if (this.globalState.projectId) {
        Object.assign(botIdParams, { project_id: this.globalState.projectId });
      }

      const res = await this.operationService.testOneNode({
        workflow_id: this.globalState.workflowId,
        space_id: this.globalState.spaceId,
        node_id: nodeId,
        input,
        batch,
        setting,
        ...botIdParams,
      });

      const executeId = res.data?.execute_id;
      if (executeId) {
        this.setTestRunState(TestRunState.Executing);
        this.execState.updateConfig({ executeId });
        executeStatus = await this.loop(executeId);
        this.finishProcess();
      }
      this.reporter.runEnd({
        testrun_type: 'node',
        testrun_result:
          this.reporter.utils.executeStatus2TestRunResult(executeStatus),
        execute_id: executeId,
      });
    } catch (error) {
      executeStatus = WorkflowExeStatus.Fail;
      this.clearTestRunResult();
      this.reporter.runEnd({
        testrun_type: 'node',
        testrun_result: 'error',
      });
      throw error;
    } finally {
      this.setTestRunState(ExecuteStatusToTestRunStateMap[executeStatus]);
    }
  }

  setTestFormDefaultValue = (defaultValue: TestFormDefaultValue[]) => {
    this.testFormState.setTestFormDefaultValue(defaultValue);
  };

  /** Polling for real-time data */
  async getRTProcessResult(obj: { executeId?: string }) {
    const { executeId } = obj;
    if (!executeId) {
      return;
    }
    let executeStatus;

    try {
      /** Request data directly */
      const result = await this.runProcess({ executeId });
      /** Update data to view */
      this.execState.updateConfig(result || {});
      this.updateExecuteState(result);
      executeStatus = result?.executeStatus;
      /**
       * When still running, turn on polling
       * Chatflow scenario, the backend may return 0, and polling is also required at this time
       */
      if (
        result?.executeStatus === WorkflowExeStatus.Running ||
        (result?.executeStatus as number) === 0
      ) {
        /** To turn on polling, you need to first make the view read-only */
        this.globalState.viewStatus = WorkflowExecStatus.EXECUTING;
        this.setTestRunState(TestRunState.Executing);
        /**
         * 1. To ensure the rhythm of the request is synchronized, sleep will also be done here
         * 2. The suspension is also valid for it, but there is no such business scenario for the time being
         */
        await Promise.all([sleep(LOOP_GAP_TIME), this.waitContinue()]);
        /** poll */
        executeStatus = await this.loop(executeId);
      }
      this.finishProcess();
    } catch (error) {
      executeStatus = WorkflowExeStatus.Fail;
      this.clearTestRunResult();
      this.execState.updateConfig({
        systemError: error.msg || error.message,
      });
    } finally {
      this.globalState.inPluginUpdated = false;
      this.setTestRunState(ExecuteStatusToTestRunStateMap[executeStatus]);
    }
  }

  async testRunTrigger(triggerId: string) {
    if (this.globalState.config.saving || !this.globalState.projectId) {
      return;
    }
    this.testFormState.freezeTestRun(triggerId);
    let executeStatus;
    let executeId = '';
    try {
      this.globalState.viewStatus = WorkflowExecStatus.EXECUTING;

      const result = await workflowApi.TestRunTrigger({
        space_id: this.globalState.spaceId,
        project_id: this.globalState.projectId,
        trigger_id: triggerId,
      });
      executeId = result?.data?.execute_id || '';
      if (executeId) {
        this.execState.updateConfig({
          executeId,
        });
        this.setTestRunState(TestRunState.Executing);
        executeStatus = await this.loop(executeId);
        this.finishProcess();
      }
      this.reporter.runEnd({
        testrun_type: 'trigger',
        testrun_result:
          this.reporter.utils.executeStatus2TestRunResult(executeStatus),
        execute_id: executeId,
      });
    } catch (error) {
      executeStatus = WorkflowExeStatus.Fail;

      this.clearTestRunResult();
      this.execState.updateConfig({
        systemError: error.msg || error.message,
      });
      this.reporter.runEnd({
        testrun_type: 'trigger',
        testrun_result: 'error',
      });
    } finally {
      this.globalState.inPluginUpdated = false;
      this.setTestRunState(ExecuteStatusToTestRunStateMap[executeStatus]);
    }
  }
}
