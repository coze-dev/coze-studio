/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';

export interface FreeGrabModalHierarchyState {
  // Modal key list
  modalHierarchyList: string[];
}

export interface FreeGrabModalHierarchyAction {
  registerModal: (key: string) => void;
  removeModal: (key: string) => void;
  getModalIndex: (key: string) => number;
  setModalToTopLayer: (key: string) => void;
}

/**
 * Hierarchical relationship between pop-ups that can be dragged and dropped freely
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
