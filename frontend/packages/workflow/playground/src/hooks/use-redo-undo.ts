import { useService } from '@flowgram-adapter/free-layout-editor';
import { HistoryService, WorkflowHistoryConfig } from '@coze-workflow/history';

export const useRedoUndo = () => {
  const historyService = useService<HistoryService>(HistoryService);
  const config = useService<WorkflowHistoryConfig>(WorkflowHistoryConfig);

  return {
    start: () => {
      historyService.start();
      config.disabled = false;
    },
    stop: () => {
      historyService.stop();
      config.disabled = true;
    },
  };
};
