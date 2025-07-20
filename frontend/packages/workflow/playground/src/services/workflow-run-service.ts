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
  /** 空置状态 */
  Idle = 'idle',
  /** 执行中 */
  Executing = 'executing',
  /** 取消 */
  Canceled = 'canceled',
  /** 暂停 */
  Paused = 'paused',
  /** 成功 */
  Succeed = 'succeed',
  // 失败
  Failed = 'failed',
}

const ExecuteStatusToTestRunStateMap = {
  [WorkflowExeStatus.Cancel]: TestRunState.Canceled,
  [WorkflowExeStatus.Fail]: TestRunState.Failed,
  [WorkflowExeStatus.Success]: TestRunState.Succeed,
};

export interface TestRunResultInfo {
  // 执行id
  executeId?: string;
}

interface TestRunOneNodeOptions {
  nodeId: string;
  input?: Record<string, string>;
  batch?: Record<string, string>;
  setting?: Record<string, string>;
  botId?: string;
  /** 是否选择应用 */
  useProject?: boolean;
}

/**
 * Workflow 执行
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
     * 画布销毁的时候触发
     */
    this.playground.toDispose.onDispose(() => this.dispose());

    this.onTestRunStateChange(({ prevState, curState }) => {
      // 监听state变化, 对testrun结果进行上报
      this.reportTestRunResult(prevState, curState);
    });
  }

  dispose() {
    /** 画布销毁，清除所有 testForm 缓存数据 */
    this.testFormState.clearFormData();
    this.testFormState.clearTestFormDefaultValue();
    /** 销毁时解冻 test run */
    this.testFormState.unfreezeTestRun();
    // 清空运行状态
    this.clearTestRun();
  }

  clearTestRun = () => {
    this.clearTestRunResult();
    this.clearTestRunState();
  };

  clearTestRunResult = () => {
    this.testFormState.unfreezeTestRun();
    this.globalState.viewStatus = WorkflowExecStatus.DEFAULT;
    // 清空节点结果，避免 test run 的时候回显
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
   * 清空运行状态
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
      // 无论是否取消成功，中止状态下取消，需要恢复轮训
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
    // 更新各个节点状态
    if (nodeResults && nodeResults.length) {
      nodeResults.forEach((nodeResult: NodeResult) => {
        const { nodeId } = nodeResult;
        if (nodeId) {
          this.execState.setNodeExecResult(nodeId, nodeResult);
          // 更新节点的线条状态
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

          // 更新节点错误
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
      // 仅当运行结果为 cancel 或者 fail 时 reason 字段才有效
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
   * 获取执行结果, 以及对服务返回数据进行预处理.
   * 可支持用执行 ID 获取, 或者直接传入服务返回数据
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

    // 一个远古的 bug ，后端返回 Warn ，前端消费 warning 。改代码影响面太大，因此在这里做一下转换
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

  // 暂停test run
  pauseTestRun = () => {
    this.setTestRunState(TestRunState.Paused);
  };

  // 继续test run
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

  // copy 原本的逻辑，每过 300ms 进行一次轮询
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
      // 根据试运行结果，刷新可发布状态
      this.globalState.reload();
    }
  };

  /* 上报test run运行结果, 用于在商店中统计运行成功率 */
  reportTestRunResult = (prevState: TestRunState, curState: TestRunState) => {
    const { executeId, isSingleMode } = this.execState.config;

    // 单节点模式不需要统计
    if (isSingleMode) {
      return;
    }

    if (![TestRunState.Succeed, TestRunState.Failed].includes(curState)) {
      return;
    }
    /* 成功 */
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
      /* 触发失败 */
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
      /* 运行失败 */
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
   * 运行 test run
   */
  testRun = async (
    input?: Record<string, string>,
    botId?: string,
    /** 当前选择的是否为应用 */
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
      // 更新视图为运行中
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
      /** 存在 variable 节点或者存在 variable 节点子流程的画布才需要传 bot_id，与 input 同级*/
      if (botId) {
        const botIdKey = useProject ? 'project_id' : 'bot_id';
        baseParam[botIdKey] = botId;
      }
      // 如果是在 project 内，则 projectId 必传
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
      // 有执行 id，test run 运行成功
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
      // 运行失败打开弹窗
      if (executeStatus === WorkflowExeStatus.Fail) {
        this.execState.openSideSheet();
      }

      // 运行后，不管成功，还原 inPluginUpdated 值，避免一直 testrun
      this.globalState.inPluginUpdated = false;
      this.setTestRunState(ExecuteStatusToTestRunStateMap[executeStatus]);
    }
  };

  /**
   * 获取执行历史数据
   */
  getProcessResult = async (config: {
    /** 是否展示节点结果 */
    showNodeResults?: boolean;
    /** 指定执行 ID, 若不填, 则展示最近一次运行结果 */
    executeId?: string;
    /** 直接结果服务端返回 */
    processResp?: GetWorkFlowProcessData;
    /** 子流程执行id */
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
         * 只把结果数据同步到节点上，但是不改变 global.config.info.status
         * 否则上一次 test run 的结果会影响到现在流程是否能够发布的状态
         * 该状态只能由真正的 test run、后端数据等真实动作修改
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
   * 获取当前 test form schema 对应的 node
   */
  getTestFormNode() {
    const schema = this.testFormState.formSchema;
    if (!schema || !schema.id) {
      return null;
    }
    return this.document.getNode(schema.id) || null;
  }

  /**
   * 单节点运行
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

      // 在项目内的话，默认使用 project_id
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

  /** 轮询获取实时的数据 */
  async getRTProcessResult(obj: { executeId?: string }) {
    const { executeId } = obj;
    if (!executeId) {
      return;
    }
    let executeStatus;

    try {
      /** 直接请求一次数据 */
      const result = await this.runProcess({ executeId });
      /** 更新数据到视图 */
      this.execState.updateConfig(result || {});
      this.updateExecuteState(result);
      executeStatus = result?.executeStatus;
      /**
       * 当仍然处于运行中，则开启轮询
       * chatflow 场景，后端可能返回 0，这时候也需要执行轮询
       */
      if (
        result?.executeStatus === WorkflowExeStatus.Running ||
        (result?.executeStatus as number) === 0
      ) {
        /** 开启轮询，需要先讲视图变为只读态 */
        this.globalState.viewStatus = WorkflowExecStatus.EXECUTING;
        this.setTestRunState(TestRunState.Executing);
        /**
         * 1. 为保证请求的节奏同步，这里也会 sleep
         * 2. 暂停同样对其有效，不过暂时没有这种业务场景
         */
        await Promise.all([sleep(LOOP_GAP_TIME), this.waitContinue()]);
        /** 轮询 */
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
