import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';

export interface FreeGrabModalHierarchyState {
  // modal 的 key list
  modalHierarchyList: string[];
}

export interface FreeGrabModalHierarchyAction {
  registerModal: (key: string) => void;
  removeModal: (key: string) => void;
  getModalIndex: (key: string) => number;
  setModalToTopLayer: (key: string) => void;
}

/**
 * 可自由拖拽的弹窗之间的层级关系
 */
export const createFreeGrabModalHierarchyStore = () =>
  create<FreeGrabModalHierarchyState & FreeGrabModalHierarchyAction>()(
    devtools(
      (set, get) => ({
        modalHierarchyList: [],
        getModalIndex: key =>
          get().modalHierarchyList.findIndex(modalKey => modalKey === key),
        registerModal: key => {
          set(
            {
              modalHierarchyList: produce(get().modalHierarchyList, draft => {
                draft.unshift(key);
              }),
            },
            false,
            'registerModal',
          );
        },
        removeModal: key => {
          set(
            {
              modalHierarchyList: produce(get().modalHierarchyList, draft => {
                const index = get().getModalIndex(key);
                if (index < 0) {
                  return;
                }
                draft.splice(index, 1);
              }),
            },
            false,
            'removeModal',
          );
        },

        setModalToTopLayer: key => {
          set(
            {
              modalHierarchyList: produce(get().modalHierarchyList, draft => {
                const index = get().getModalIndex(key);
                if (index < 0) {
                  return;
                }
                get().removeModal(key);
                get().registerModal(key);
              }),
            },
            false,
            'setModalToTopLayer',
          );
        },
      }),
      {
        enabled: IS_DEV_MODE,
        name: 'botStudio.botEditor.ModalHierarchy',
      },
    ),
  );

export type FreeGrabModalHierarchyStore = ReturnType<
  typeof createFreeGrabModalHierarchyStore
>;
