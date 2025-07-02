import { useIDEService } from '@coze-project-ide/client';

import { ProjectIDEServices } from '../plugins/create-preset-plugin/project-ide-services';

export const useProjectIDEServices = (): ProjectIDEServices => {
  const projectIDEServices =
    useIDEService<ProjectIDEServices>(ProjectIDEServices);

  return projectIDEServices;
};
