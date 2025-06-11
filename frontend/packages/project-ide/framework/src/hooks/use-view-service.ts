import { type ViewService } from '@/plugins/create-preset-plugin/view-service';

import { useProjectIDEServices } from './use-project-ide-services';

/**
 * 获取 ProjectIDE 所有视图操作
 */
export const useViewService = (): ViewService => {
  const projectIDEServices = useProjectIDEServices();
  return projectIDEServices.view;
};
