import { useMutation } from '@tanstack/react-query';
import { useService } from '@flowgram-adapter/free-layout-editor';

import { WorkflowRunService } from '../../../services';

export const useCancelTestRun = () => {
  const runService = useService<WorkflowRunService>(WorkflowRunService);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => await runService.cancelTestRun(),
  });

  const cancelTestRun = async () => await mutate();

  return {
    cancelTestRun,
    canceling: isPending,
  };
};
