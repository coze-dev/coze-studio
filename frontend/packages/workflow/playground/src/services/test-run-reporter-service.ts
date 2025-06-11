import { inject, injectable } from 'inversify';
import {
  Tracker,
  ReporterEventName,
  type PickReporterParams,
  type ReporterParams,
} from '@coze-workflow/test-run';
import Tea from '@coze-arch/tea';
import { WorkflowExeStatus } from '@coze-arch/bot-api/workflow_api';

import { WorkflowGlobalStateEntity } from '../entities';

const utils = {
  executeStatus2TestRunResult: (executeStatus: WorkflowExeStatus) => {
    const map = {
      [WorkflowExeStatus.Success]: 'success',
      [WorkflowExeStatus.Cancel]: 'cancel',
      [WorkflowExeStatus.Fail]: 'fail',
    };
    return map[executeStatus] || 'success';
  },
};

@injectable()
export class TestRunReporterService {
  @inject(WorkflowGlobalStateEntity)
  readonly globalState: WorkflowGlobalStateEntity;

  tracker = new Tracker();

  utils = utils;

  private send<T extends ReporterEventName>(key: T, params: ReporterParams[T]) {
    if (!Tea || typeof Tea.event !== 'function') {
      return;
    }
    Tea.event(key, params);
  }

  private workflowCommonParams() {
    const params = {
      space_id: this.globalState.spaceId,
      workflow_id: this.globalState.workflowId,
      project_id: this.globalState.projectId,
      workflow_mode: this.globalState.flowMode,
    };
    return params;
  }

  tryStart(params: PickReporterParams<ReporterEventName.TryStart, 'scene'>) {
    const data: ReporterParams[ReporterEventName.TryStart] = {
      ...this.workflowCommonParams(),
      ...params,
    };

    this.send(ReporterEventName.TryStart, data);
  }
  runEnd(
    params: PickReporterParams<
      ReporterEventName.RunEnd,
      'testrun_type' | 'testrun_result' | 'execute_id'
    >,
  ) {
    const data: ReporterParams[ReporterEventName.RunEnd] = {
      ...this.workflowCommonParams(),
      ...params,
    };

    this.send(ReporterEventName.RunEnd, data);
  }
  /** form schema 生成速度上报 */
  formSchemaGen = {
    start: () => this.tracker.start(),
    end: (
      key: string,
      params: PickReporterParams<ReporterEventName.FormSchemaGen, 'node_type'>,
    ) => {
      const time = this.tracker.end(key);
      if (!time) {
        return;
      }
      const data: ReporterParams[ReporterEventName.FormSchemaGen] = {
        ...this.workflowCommonParams(),
        duration: time.duration,
        ...params,
      };
      this.send(ReporterEventName.FormSchemaGen, data);
    },
  };
  formRunUIMode(
    params: PickReporterParams<ReporterEventName.FormRunUIMode, 'form_ui_mode'>,
  ) {
    const data: ReporterParams[ReporterEventName.FormRunUIMode] = {
      ...this.workflowCommonParams(),
      ...params,
    };
    this.send(ReporterEventName.FormRunUIMode, data);
  }
  formGenDataOrigin(
    params: PickReporterParams<
      ReporterEventName.FormGenDataOrigin,
      'gen_data_origin'
    >,
  ) {
    const data: ReporterParams[ReporterEventName.FormGenDataOrigin] = {
      ...this.workflowCommonParams(),
      ...params,
    };
    this.send(ReporterEventName.FormGenDataOrigin, data);
  }
  logRawOutputDifference(
    params: PickReporterParams<
      ReporterEventName.LogOutputDifference,
      'error_msg' | 'log_node_type' | 'is_difference'
    >,
  ) {
    const data: ReporterParams[ReporterEventName.LogOutputDifference] = {
      ...this.workflowCommonParams(),
      ...params,
    };
    this.send(ReporterEventName.LogOutputDifference, data);
  }
  logOutputMarkdown(
    params: PickReporterParams<
      ReporterEventName.LogOutputMarkdown,
      'action_type'
    >,
  ) {
    const data: ReporterParams[ReporterEventName.LogOutputMarkdown] = {
      ...this.workflowCommonParams(),
      ...params,
    };
    this.send(ReporterEventName.LogOutputMarkdown, data);
  }
  traceOpen(
    params: PickReporterParams<
      ReporterEventName.TraceOpen,
      'log_id' | 'panel_type'
    >,
  ) {
    const data: ReporterParams[ReporterEventName.TraceOpen] = {
      ...this.workflowCommonParams(),
      ...params,
    };

    this.send(ReporterEventName.TraceOpen, data);
  }
}
