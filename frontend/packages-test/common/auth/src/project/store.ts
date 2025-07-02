import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

import { type ProjectRoleType } from './constants';

interface ProjectAuthStoreState {
  // 每一个Project的角色数据
  roles: {
    [projectId: string]: ProjectRoleType[];
  };
  // 每一个Project的角色数据的初始化状态，是否完成初始化。
  isReady: {
    [projectId: string]: boolean;
  };
}

interface SpaceAuthStoreAction {
  // 设置projectId对应的Project的角色
  setRoles: (projectId: string, role: ProjectRoleType[]) => void;
  // 设置projectId对应的Project的数据是否ready
  setIsReady: (projectId: string, isReady: boolean) => void;
  // 回收Project数据
  destory: (projectId) => void;
}
/**
 * ProjectAuthStore设计成支持多Project切换，维护多个Project的数据，防止因为Project切换时序导致的bug。
 */
export const useProjectAuthStore = create<
  ProjectAuthStoreState & SpaceAuthStoreAction
>()(
  devtools(
    set => ({
      roles: {},
      isReady: {},
      setRoles: (projectId, roles) =>
        set(state => ({
          roles: {
            ...state.roles,
            [projectId]: roles,
          },
        })),
      setIsReady: (projectId, isReady) =>
        set(state => ({ isReady: { ...state.isReady, [projectId]: isReady } })),
      destory: projectId =>
        set(state => ({
          roles: { ...state.roles, [projectId]: [] },
          isReady: { ...state.isReady, [projectId]: false },
        })),
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.projectAuthStore',
    },
  ),
);
