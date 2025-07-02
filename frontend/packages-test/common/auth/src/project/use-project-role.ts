import { useShallow } from 'zustand/react/shallow';

import { useProjectAuthStore } from './store';
import { type ProjectRoleType } from './constants';

export function useProjectRole(projectId: string): ProjectRoleType[] {
  const { isReady: isProjectReady, role: projectRole = [] } =
    useProjectAuthStore(
      useShallow(store => ({
        isReady: store.isReady[projectId],
        role: store.roles[projectId],
      })),
    );

  if (!isProjectReady) {
    throw new Error(
      'useProjectAuth must be used after useInitProjectRole has been completed.',
    );
  }

  return projectRole;
}
