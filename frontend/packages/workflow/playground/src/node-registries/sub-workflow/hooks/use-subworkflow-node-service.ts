import { useService } from '@flowgram-adapter/free-layout-editor';

import { SubWorkflowNodeService, type SubWorkflowNodeStore } from '../services';

export const useSubWorkflowNodeService = () =>
  useService<SubWorkflowNodeService>(SubWorkflowNodeService);

export const useSubWorkflowNodeStore = <T>(
  selector: (s: SubWorkflowNodeStore) => T,
) => {
  const subWorkflowService = useSubWorkflowNodeService();
  return subWorkflowService.store(selector);
};
