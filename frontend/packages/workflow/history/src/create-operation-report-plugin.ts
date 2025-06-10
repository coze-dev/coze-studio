import {
  definePluginCreator,
  type PluginCreator,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowOperationReportService } from './services/workflow-operation-report-service';

export const createOperationReportPlugin: PluginCreator<object> =
  definePluginCreator<object>({
    onBind: ({ bind }) => {
      bind(WorkflowOperationReportService).toSelf().inSingletonScope();
    },
    onInit(ctx): void {
      ctx
        .get<WorkflowOperationReportService>(WorkflowOperationReportService)
        .init();
    },
    onDispose(ctx) {
      ctx
        .get<WorkflowOperationReportService>(WorkflowOperationReportService)
        .dispose();
    },
  });
